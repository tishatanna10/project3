"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { careers } from "@/lib/supabase/careers/career";
import { Button } from "@/components/ui/Button";

type Exchange = {
  question: string;
  answer: string;
  answerMeta: { durationSeconds: number; fillerWords: Record<string, number>; speechRecognitionUsed: boolean };
  presenceMetrics?: PresenceMetrics;
};

type PresenceMetrics = {
  samples: number;
  lookingTowardSamples: number;
  lookingAwaySamples: number;
  averageHeadMovement: number;
  blinkCount: number;
};

type Report = {
  overallScore: number;
  categoryScores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  topImprovements: string[];
  speechPatterns: string[];
  finalReview: string;
  perQuestionFeedback: Array<{ question: string; answer: string; whatWentWell: string; whatCouldBeBetter: string; betterApproach: string; presencePatterns?: string[] }>;
};

type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

const customRoleValue = "__custom_role__";
const fillerWords = ["um", "uh", "like", "actually", "basically"];

type PresenceTrackerState = PresenceMetrics & { previousNose?: { x: number; y: number }; previousEyeDistance?: number; eyesClosed?: boolean; lastBlinkAt?: number };

function emptyPresenceTrackerState(): PresenceTrackerState {
  return { samples: 0, lookingTowardSamples: 0, lookingAwaySamples: 0, averageHeadMovement: 0, blinkCount: 0 };
}

function snapshotPresenceMetrics(state: PresenceTrackerState): PresenceMetrics | undefined {
  if (!state.samples) return undefined;
  return { samples: state.samples, lookingTowardSamples: state.lookingTowardSamples, lookingAwaySamples: state.lookingAwaySamples, averageHeadMovement: Number(state.averageHeadMovement.toFixed(4)), blinkCount: state.blinkCount };
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function eyeAspectRatio(landmarks: Array<{ x: number; y: number }>, outer: number, inner: number, upper: number, lower: number) {
  return distance(landmarks[upper], landmarks[lower]) / Math.max(distance(landmarks[outer], landmarks[inner]), 0.001);
}

function recordPresenceSample(landmarks: Array<{ x: number; y: number }>, timestamp: number, state: PresenceTrackerState) {
  const nose = landmarks[1];
  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  if (!nose || !leftEye || !rightEye) return;
  const eyeDistance = distance(leftEye, rightEye);
  const eyeMidpoint = { x: (leftEye.x + rightEye.x) / 2, y: (leftEye.y + rightEye.y) / 2 };
  const turnedAway = Math.abs(nose.x - eyeMidpoint.x) / Math.max(eyeDistance, 0.001) > 0.18;
  state.samples += 1;
  if (turnedAway) state.lookingAwaySamples += 1;
  else state.lookingTowardSamples += 1;
  if (state.previousNose && state.previousEyeDistance) {
    const movement = distance(nose, state.previousNose) / Math.max((eyeDistance + state.previousEyeDistance) / 2, 0.001);
    state.averageHeadMovement += (movement - state.averageHeadMovement) / Math.max(state.samples - 1, 1);
  }
  state.previousNose = nose;
  state.previousEyeDistance = eyeDistance;
  const leftRatio = eyeAspectRatio(landmarks, 33, 133, 159, 145);
  const rightRatio = eyeAspectRatio(landmarks, 263, 362, 386, 374);
  const eyesClosed = (leftRatio + rightRatio) / 2 < 0.18;
  if (eyesClosed && !state.eyesClosed && (!state.lastBlinkAt || timestamp - state.lastBlinkAt > 150)) {
    state.blinkCount += 1;
    state.lastBlinkAt = timestamp;
  }
  state.eyesClosed = eyesClosed;
}

function countFillers(answer: string) {
  return Object.fromEntries(fillerWords.map((word): [string, number] => [word, (answer.match(new RegExp(`\\b${word}\\b`, "gi")) ?? []).length]).filter(([, count]) => count > 0)) as Record<string, number>;
}

export default function InterviewPage() {
  const jobTitles = useMemo(() => Array.from(new Set(careers.flatMap((career) => career.jobTitles))).sort(), []);
  const [selectedRole, setSelectedRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [phase, setPhase] = useState<"setup" | "interview" | "analyzing" | "report">("setup");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [interimText, setInterimText] = useState("");
  const [conversation, setConversation] = useState<Exchange[]>([]);
  const [marketSnippets, setMarketSnippets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<Recognition | null>(null);
  const answerStartedAt = useRef<number | null>(null);
  const presenceTrackerRef = useRef<PresenceTrackerState>(emptyPresenceTrackerState());
  const faceLandmarkerRef = useRef<{ detectForVideo: (video: HTMLVideoElement, timestamp: number) => { faceLandmarks?: Array<Array<{ x: number; y: number }>> }; close: () => void } | null>(null);
  const targetRole = selectedRole === customRoleValue ? customRole.trim() : selectedRole;

  useEffect(() => {
    setSpeechSupported(Boolean((window as Window & { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition));
    return () => {
      recognitionRef.current?.abort();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      faceLandmarkerRef.current?.close();
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    if (phase === "interview" && videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current;
  }, [phase]);

  useEffect(() => {
    if (phase !== "interview" || !question) return;
    presenceTrackerRef.current = emptyPresenceTrackerState();
  }, [phase, question]);

  useEffect(() => {
    if (phase !== "interview") return;
    let cancelled = false;
    let animationFrame = 0;
    let lastSampleAt = 0;
    async function startPresenceTracking() {
      try {
        const video = videoRef.current;
        if (!video) return;
        if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) await new Promise<void>((resolve) => video.addEventListener("loadeddata", () => resolve(), { once: true }));
        const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
        if (cancelled) return;
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
        const landmarker = await FaceLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task" }, runningMode: "VIDEO", numFaces: 1 });
        if (cancelled) { landmarker.close(); return; }
        faceLandmarkerRef.current = landmarker;
        const track = (timestamp: number) => {
          if (cancelled || !videoRef.current) return;
          if (timestamp - lastSampleAt >= 100) {
            lastSampleAt = timestamp;
            const landmarks = landmarker.detectForVideo(videoRef.current, timestamp).faceLandmarks?.[0];
            if (landmarks) recordPresenceSample(landmarks, timestamp, presenceTrackerRef.current);
          }
          animationFrame = requestAnimationFrame(track);
        };
        animationFrame = requestAnimationFrame(track);
      } catch {
        // Presence tracking is optional; the interview continues without it.
      }
    }
    void startPresenceTracking();
    return () => { cancelled = true; cancelAnimationFrame(animationFrame); faceLandmarkerRef.current?.close(); faceLandmarkerRef.current = null; };
  }, [phase]);

  useEffect(() => {
    if (phase === "interview" && question && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(question));
    }
  }, [phase, question]);

  function stopCamera() {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    faceLandmarkerRef.current?.close();
    faceLandmarkerRef.current = null;
    window.speechSynthesis?.cancel();
    setIsListening(false);
  }

  async function requestQuestion(transcript: Exchange[], snippets = marketSnippets) {
    if (!resume) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.set("role", targetRole);
    formData.set("resume", resume);
    formData.set("jobDescription", jobDescription);
    formData.set("conversation", JSON.stringify(transcript));
    formData.set("marketSnippets", JSON.stringify(snippets));

    try {
      const response = await fetch("/api/interview", { method: "POST", body: formData });
      const data = (await response.json()) as { question?: string; marketSnippets?: string[]; shouldEnd?: boolean; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Unable to continue the interview.");
      if (data.shouldEnd) {
        await finishInterview(transcript);
        return;
      }
      if (!data.question) throw new Error("The interviewer did not return a question.");
      setQuestion(data.question);
      setMarketSnippets(data.marketSnippets ?? snippets);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to continue the interview.");
      if (transcript.length === 0) {
        stopCamera();
        setPhase("setup");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function startInterview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resume || !targetRole) {
      setError("Choose a target role and upload your resume.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera and microphone access are not supported in this browser.");
      return;
    }

    setError("");
    setReport(null);
    setConversation([]);
    setQuestion("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
      streamRef.current = stream;
      setPhase("interview");
      await requestQuestion([], []);
    } catch (cameraError) {
      setError(cameraError instanceof DOMException && cameraError.name === "NotAllowedError" ? "Camera or microphone permission was denied. Allow both permissions to start the mock interview." : "Unable to access your camera or microphone. Check your device and browser settings.");
      stopCamera();
    }
  }

  function speakQuestion() {
    if (question && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(question));
    }
  }

  function startListening() {
    const Constructor = (window as Window & { webkitSpeechRecognition?: new () => Recognition }).webkitSpeechRecognition;
    if (!Constructor) {
      setError("Live speech transcription is not supported in this browser. You can type your answer instead.");
      return;
    }
    setError("");
    setInterimText("");
    answerStartedAt.current ??= Date.now();
    const recognition = new Constructor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      let finalText = "";
      let liveText = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal) finalText += result[0].transcript;
        else liveText += result[0].transcript;
      }
      if (finalText) setAnswer((current) => `${current}${current ? " " : ""}${finalText.trim()}`);
      setInterimText(liveText);
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error !== "aborted" && event.error !== "no-speech") setError(`Speech recognition error: ${event.error}. You can type your answer instead.`);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setError("Speech recognition could not start. You can type your answer instead.");
    }
  }

  async function finishInterview(transcript: Exchange[]) {
    stopCamera();
    setPhase("analyzing");
    try {
      const response = await fetch("/api/interview/analyze", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ role: targetRole, transcript }) });
      const data = (await response.json()) as { report?: Report; error?: string };
      if (!response.ok || !data.report) throw new Error(data.error ?? "Unable to create your interview report.");
      setReport(data.report);
      setPhase("report");
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "Unable to create your interview report.");
      setPhase("setup");
    }
  }

  async function submitAnswer() {
    const candidateAnswer = answer.trim();
    if (!candidateAnswer || isLoading) {
      setError("Add an answer before continuing.");
      return;
    }
    recognitionRef.current?.stop();
    const durationSeconds = answerStartedAt.current ? Math.max(1, Math.round((Date.now() - answerStartedAt.current) / 1000)) : 0;
    const presenceMetrics = snapshotPresenceMetrics(presenceTrackerRef.current);
    const nextConversation = [...conversation, { question, answer: candidateAnswer, answerMeta: { durationSeconds, fillerWords: countFillers(candidateAnswer), speechRecognitionUsed: speechSupported }, ...(presenceMetrics ? { presenceMetrics } : {}) }];
    setConversation(nextConversation);
    setAnswer("");
    setInterimText("");
    answerStartedAt.current = null;
    await requestQuestion(nextConversation);
  }

  if (phase === "report" && report) return <InterviewReport report={report} onRestart={() => { setPhase("setup"); setReport(null); setError(""); }} />;
  if (phase === "analyzing") return <main className="flex flex-1 items-center justify-center bg-slate-50 px-4 text-sm text-slate-600">Creating your interview report...</main>;

  return (
    <main className="flex flex-1 bg-slate-50 px-4 py-10 sm:py-12">
      <div className="mx-auto w-full max-w-5xl">
        {phase === "setup" ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            <p className="text-sm font-semibold text-indigo-600">Camera mock interview</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Practice with your resume in mind</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">We&apos;ll use your resume and role to ask ten tailored questions. Your camera and microphone are used in the browser and stop when the session ends.</p>
            <form onSubmit={startInterview} className="mt-8 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">Target role<select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"><option value="">Choose a role</option>{jobTitles.map((title) => <option key={title} value={title}>{title}</option>)}<option value={customRoleValue}>Other — type a role</option></select></label>
              {selectedRole === customRoleValue ? <label className="text-sm font-medium text-slate-700">Custom role<input value={customRole} onChange={(event) => setCustomRole(event.target.value)} placeholder="e.g. Security Analyst" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100" /></label> : <div className="hidden sm:block" />}
              <label className="text-sm font-medium text-slate-700 sm:col-span-2">Resume<input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => setResume(event.target.files?.[0] ?? null)} className="mt-2 block w-full cursor-pointer rounded-lg border border-slate-300 text-sm text-slate-600 file:mr-4 file:border-0 file:bg-indigo-50 file:px-4 file:py-2.5 file:font-semibold file:text-indigo-700" /><span className="mt-2 block text-xs font-normal text-slate-500">PDF or DOCX, up to 5 MB{resume ? ` · ${resume.name}` : ""}</span></label>
              <label className="text-sm font-medium text-slate-700 sm:col-span-2">Job description <span className="font-normal text-slate-500">(optional)</span><textarea value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} rows={5} placeholder="Paste the job description for more targeted questions..." className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100" /></label>
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2" role="alert">{error}</p>}
              <div className="sm:col-span-2"><Button disabled={!resume || !targetRole || isLoading}>{isLoading ? "Preparing interview..." : "Start interview"}</Button></div>
            </form>
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm"><video ref={videoRef} autoPlay muted playsInline className="aspect-video w-full object-cover" /><p className="px-4 py-3 text-sm text-slate-300">Camera on · Question {conversation.length + 1} of 10</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><p className="text-sm font-semibold text-indigo-600">Mock interviewer</p><h1 className="mt-3 text-2xl font-bold leading-8 tracking-tight text-slate-900">{isLoading ? "Preparing your next question..." : question}</h1><button type="button" onClick={speakQuestion} disabled={!question} className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-500">Speak question again</button><div className="mt-6"><div className="flex flex-wrap items-center justify-between gap-3"><label className="text-sm font-semibold text-slate-700" htmlFor="answer">Your answer</label>{speechSupported ? <button type="button" onClick={isListening ? () => recognitionRef.current?.stop() : startListening} className={`rounded-lg px-3 py-2 text-sm font-semibold ${isListening ? "bg-red-50 text-red-700" : "bg-indigo-50 text-indigo-700"}`}>{isListening ? "Stop listening" : "Use microphone"}</button> : <span className="text-xs text-slate-500">Voice transcription isn&apos;t supported here; type your answer.</span>}</div><textarea id="answer" value={answer} onChange={(event) => setAnswer(event.target.value)} rows={8} placeholder="Your answer will appear here. You can edit it before submitting." className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100" />{interimText && <p className="mt-2 text-sm italic text-slate-500">Listening: {interimText}</p>}</div>{error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}<button type="button" onClick={() => void submitAnswer()} disabled={isLoading || !answer.trim()} className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">{conversation.length === 9 ? "Submit final answer" : "Submit answer & continue"}</button></div>
          </section>
        )}
      </div>
    </main>
  );
}

function InterviewReport({ report, onRestart }: { report: Report; onRestart: () => void }) {
  return (
    <main className="flex flex-1 bg-slate-50 px-4 py-10 sm:py-12">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10"><p className="text-sm font-semibold text-indigo-600">Interview post-mortem</p><div className="mt-3 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold tracking-tight text-slate-900">Your practice report</h1><p className="mt-2 text-sm text-slate-600">Scores reflect this practice transcript, not a hiring decision.</p></div><p className="text-5xl font-bold tracking-tight text-indigo-600">{report.overallScore}<span className="text-xl">/100</span></p></div><div className="mt-7 grid gap-3 sm:grid-cols-5">{Object.entries(report.categoryScores).map(([category, score]) => <div key={category} className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-semibold capitalize text-slate-500">{category.replace(/([A-Z])/g, " $1")}</p><p className="mt-1 text-xl font-bold text-slate-900">{score}</p></div>)}</div></section>
        <div className="grid gap-5 md:grid-cols-2"><ListCard title="Strengths" items={report.strengths} tone="emerald" /><ListCard title="Areas to improve" items={report.weaknesses} tone="amber" /></div>
        <ListCard title="Top improvements for your next interview" items={report.topImprovements} tone="indigo" />
        <ListCard title="Speech patterns observed" items={report.speechPatterns} tone="slate" />
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><h2 className="text-xl font-bold text-slate-900">Question-by-question feedback</h2><div className="mt-5 space-y-5">{report.perQuestionFeedback.map((item, index) => <article key={`${item.question}-${index}`} className="rounded-xl border border-slate-200 p-5"><p className="font-semibold text-slate-900">{index + 1}. {item.question}</p><p className="mt-3 text-sm leading-6 text-slate-600"><span className="font-semibold text-slate-800">Your answer: </span>{item.answer}</p><p className="mt-3 text-sm leading-6 text-emerald-800"><span className="font-semibold">Worked well: </span>{item.whatWentWell}</p><p className="mt-2 text-sm leading-6 text-amber-800"><span className="font-semibold">Could improve: </span>{item.whatCouldBeBetter}</p><p className="mt-2 text-sm leading-6 text-indigo-800"><span className="font-semibold">Better approach: </span>{item.betterApproach}</p>{item.presencePatterns?.length ? <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700"><span className="font-semibold text-slate-800">Observable presence patterns: </span>{item.presencePatterns.join(" ")}</div> : null}</article>)}</div></section>
        {report.finalReview && <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm sm:p-8"><p className="text-sm font-semibold text-indigo-700">Your key takeaway</p><h2 className="mt-2 text-2xl font-bold text-indigo-950">Final interview review</h2><div className="mt-4 whitespace-pre-line text-sm leading-7 text-indigo-950">{report.finalReview}</div></section>}
        <Button onClick={onRestart}>Practice another interview</Button>
      </div>
    </main>
  );
}

function ListCard({ title, items, tone }: { title: string; items: string[]; tone: "emerald" | "amber" | "indigo" | "slate" }) {
  const styles = { emerald: "border-emerald-100 bg-emerald-50 text-emerald-950", amber: "border-amber-100 bg-amber-50 text-amber-950", indigo: "border-indigo-100 bg-indigo-50 text-indigo-950", slate: "border-slate-200 bg-white text-slate-900" };
  return <section className={`rounded-2xl border p-6 shadow-sm ${styles[tone]}`}><h2 className="text-xl font-bold">{title}</h2>{items.length ? <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6">{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="mt-4 text-sm">No specific patterns identified.</p>}</section>;
}

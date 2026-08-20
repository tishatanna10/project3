import Link from "next/link";
import styles from "./page.module.css";
import { Button } from "@/components/ui/Button";

const journey = [
  ["01", "Assessment", "Discover what energises you through real-world scenarios."],
  ["02", "Career Matches", "See the roles that fit you — and exactly why they do."],
  ["03", "Roadmap", "Turn your best match into a clear, manageable learning plan."],
  ["04", "Resume", "Build evidence of your strengths in a resume employers can scan."],
  ["05", "Interview Practice", "Practise out loud and refine your answers with useful feedback."],
];

const features = [
  ["Career Assessment", "Scenario-based prompts reveal how you think and work — not just what you say you like."],
  ["Personalized Career Matches", "A clear match percentage, plus the strengths and preferences behind every recommendation."],
  ["Career Roadmaps", "A step-by-step learning path that makes the next move feel practical and achievable."],
  ["AI Career Chatbot", "Ask the questions on your mind whenever they arise, from subject choices to career pivots."],
  ["Resume Analyzer", "See how your resume aligns with the skills and language employers are looking for right now."],
  ["Mock Interview", "Use your camera to practise naturally, then get detailed feedback you can act on."],
];

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <nav className={styles.nav} aria-label="Main navigation">
          <Link href="/" className={styles.brand} aria-label="Pathwise home">
            path<span>wise</span>
          </Link>
          <Link href="/login" className={styles.loginLink}>Log in</Link>
        </nav>

        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>CAREER GUIDANCE, CONNECTED</p>
          <h1>From “I don’t know what career to choose” to fully job-ready — all in one place.</h1>
          <p className={styles.heroCopy}>
            Find your direction, build the skills to get there, and step into each opportunity with confidence.
          </p>
          <Button href="/signup" className={styles.primaryButton}>
            Start finding your path <span aria-hidden="true">→</span>
          </Button>
        </div>

        <p className={styles.heroFootnote}>Made for students figuring it out as they go.</p>
      </section>

      <section className={styles.journeySection} aria-labelledby="journey-title">
        <div className={styles.sectionHeading}>
          <p className={styles.kicker}>YOUR JOURNEY</p>
          <h2 id="journey-title">A path that keeps moving forward.</h2>
          <p>You do not need to solve your future in one sitting. Start where you are, then take the next clear step.</p>
        </div>

        <ol className={styles.journeyList}>
          {journey.map(([number, title, description]) => (
            <li className={styles.journeyItem} key={title}>
              <div className={styles.stepNumber}>{number}</div>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.featuresSection} aria-labelledby="features-title">
        <div className={`${styles.sectionHeading} ${styles.lightHeading}`}>
          <p className={styles.kicker}>EVERYTHING CONNECTS</p>
          <h2 id="features-title">Tools that meet you at every stage.</h2>
        </div>
        <div className={styles.featureGrid}>
          {features.map(([title, description], index) => (
            <article className={styles.featureCard} key={title}>
              <span className={styles.featureNumber}>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.differenceSection} aria-labelledby="difference-title">
        <p className={styles.kicker}>WHY IT&apos;S DIFFERENT</p>
        <div className={styles.differenceGrid}>
          <h2 id="difference-title">One-off advice can leave you with more tabs than answers.</h2>
          <div className={styles.differenceCopy}>
            <p>Most career sites give you one tool, one result, then send you on your way. Pathwise turns each insight into the next useful action.</p>
            <p>Your assessment informs your matches. Your matches shape your roadmap. Your roadmap strengthens your resume and interview practice. It is one connected journey, built around you.</p>
          </div>
        </div>
      </section>

      <section className={styles.finalCta}>
        <p className={styles.kicker}>YOUR NEXT STEP</p>
        <h2>Clarity is closer than you think.</h2>
        <p>Take the first step toward a career that feels like yours.</p>
        <Button href="/signup" className={styles.primaryButton}>
          Create your free account <span aria-hidden="true">→</span>
        </Button>
      </section>

      <footer className={styles.footer}>
        <Link href="/" className={styles.brand}>path<span>wise</span></Link>
        <p>Career clarity for the road ahead.</p>
        <Link href="/signup" className={styles.footerLink}>Get started</Link>
      </footer>
    </main>
  );
}

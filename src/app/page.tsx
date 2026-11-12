import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Bowles Docs</h1>
      <p>Your documentation starts here.</p>
      <Link href="/login"><button className="landing-page-btn">Login</button></Link>
      <Link href="/signup"><button className="landing-page-btn">Sign-Up</button></Link>
    </main>
  );
}

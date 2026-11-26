import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What Neuronaut stores on your device, and exactly what Ask Pip sends to Anthropic.",
};

export default function PrivacyPage() {
  return (
    <article className="wrap prose">
      <h1>Privacy</h1>
      <p className="lede">
        Short version: lessons and progress stay on your device. The one thing that leaves it is what you type into Ask Pip,
        which is sent to Anthropic&rsquo;s Claude to write the answer. Neuronaut is for students aged 13 and up.
      </p>
      <h2>What we store</h2>
      <p>
        Your lesson progress (XP, streak, completed lessons, badges and review schedule) is saved in your own browser&rsquo;s
        local storage. It never leaves your device unless you download a backup file yourself.
      </p>
      <h2>What we don&rsquo;t do</h2>
      <ul>
        <li>No accounts, names, emails or passwords.</li>
        <li>No chat history stored by Neuronaut.</li>
        <li>No advertising, analytics or tracking scripts.</li>
        <li>No cookies.</li>
      </ul>
      <h2>Ask Pip (AI tutor)</h2>
      <p>
        Ask Pip is optional, and it asks for your OK before your first question. Each time you send a question, our server
        sends Claude (an AI model made by Anthropic) three things: your question, the earlier messages in that same chat, and
        short passages from our lessons that match it. Neuronaut doesn&rsquo;t store your chats. Anthropic handles that data under its own{" "}
        <a href="https://www.anthropic.com/legal/privacy">privacy policy</a>. Please don&rsquo;t type personal information into
        Ask Pip. Pip&rsquo;s answers are written by AI and can be wrong.
      </p>
      <h2>Who it&rsquo;s for</h2>
      <p>
        Neuronaut is made for high school students, ages 13 and up. Lessons need no account. If you&rsquo;re under 13, please
        use the lessons without Ask Pip, or ask a parent or teacher first.
      </p>
      <h2>Third parties</h2>
      <p>
        Photos load from Unsplash&rsquo;s image servers, and fonts are self-hosted with the site. Like any website, Unsplash
        can see that an image was requested by your browser. Links to outside sources open those sites, which have their
        own privacy policies.
      </p>
      <h2>Deleting your data</h2>
      <p>
        Use &ldquo;Start over&rdquo; on the My progress page, or clear this site&rsquo;s data in your browser settings.
      </p>
    </article>
  );
}

export const metadata = {
  title: "About – NaijaLingo",
  description: "About the NaijaLingo project",
};

export default function AboutPage() {
  return (
    <div className="prose prose-stone mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-stone-900">About NaijaLingo</h1>
      <p className="text-stone-700 leading-relaxed">
        NaijaLingo is a Nigerian language technology project. It starts with a practical English ↔
        Urhobo translation tool and a way for native speakers to contribute high-quality pairs and
        corrections.
      </p>
      <p className="text-stone-700 leading-relaxed">
        The long-term vision is language technology that understands not only vocabulary and grammar
        but also natural phrasing, local usage, accents, intonation, and cultural context. We do not
        train models from scratch in this MVP. Instead we build a clean foundation, collect real
        data with consent, and keep the architecture open for future custom models and additional
        Nigerian languages.
      </p>
      <p className="text-stone-700 leading-relaxed">
        Machine output is never treated as authoritative. Native-speaker judgment is the source of
        truth. If you speak Urhobo (or another Nigerian language we add later), your contributions
        and reviews are the most valuable part of this work.
      </p>
      <p className="text-stone-700 leading-relaxed">
        See the repository README and docs for architecture, roadmap, and how to run the project
        locally.
      </p>
    </div>
  );
}

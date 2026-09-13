import type { Metadata } from "next";
import { SectionHeading } from "@/components/home/SectionHeading";
import {
  legalHeading,
  legalParagraph,
  legalStrong,
  legalLink,
  legalAddress,
} from "@/components/legal/prose";
import { CONTACT_EMAIL } from "@/lib/site-content";

export const metadata: Metadata = {
  // The root layout's title template appends the brand.
  title: "Privacy policy",
  description:
    "How Elemwave processes personal data under the GDPR and Spain's Organic Law 3/2018, and the rights you can exercise.",
};

/**
 * An English translation of the approved Spanish privacy policy.
 */
export default function PrivacyPolicy() {
  return (
    <section className="bg-surface px-[clamp(20px,4vw,56px)] pb-[clamp(56px,8vw,110px)] pt-[clamp(48px,7vw,88px)]">
      <div className="mx-auto max-w-[820px]">
        <SectionHeading as="h1" title="Privacy policy" />

        <p className={`${legalParagraph} mt-10`}>
          In compliance with Regulation (EU) 2016/679 of the European Parliament
          and of the Council on the protection of natural persons with regard to
          the processing of personal data and on the free movement of such data
          (GDPR), and Spain&apos;s Organic Law 3/2018 on the Protection of
          Personal Data and Guarantee of Digital Rights, we inform you of how your
          personal data is processed.
        </p>
        <p className={legalParagraph}>
          At <strong className={legalStrong}>Elemwave</strong> we apply the
          security measures necessary to prevent the alteration, loss,
          unauthorised processing of or access to personal data, taking into
          account at all times the state of the art, and to protect your data and
          keep it strictly confidential.
        </p>
        <p className={legalParagraph}>
          Nevertheless, users should be aware that security measures on the
          Internet are not impregnable. In every case we respect the wishes of our
          contacts regarding the processing of their information. Users are
          responsible for the accuracy of the information they provide to us and
          for keeping it up to date. Likewise, they will be responsible for any
          loss or damage that may arise from the data supplied being false,
          inaccurate or out of date.
        </p>

        <h2 className={legalHeading}>Data controller</h2>
        <address className={legalAddress}>
          Elemwave
          <br />
          B06913164
          <br />
          Calle Recogidas, 35, 1A
          <br />
          18005 Granada, Spain
          <br />
          Contact:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className={legalLink}>
            {CONTACT_EMAIL}
          </a>
        </address>

        <h2 className={legalHeading}>Purpose</h2>
        <p className={legalParagraph}>
          <strong className={legalStrong}>Contact</strong>: We will only ask for
          the information strictly necessary at any given time to provide our
          services and to keep you informed of news and other content related to
          the Company that may be of interest to you.
        </p>
        <p className={legalParagraph}>
          <strong className={legalStrong}>Social media</strong>: We are present on
          various social networks. You may provide personal data through our
          profile; in that case, your data is processed for the purpose of
          interacting through that channel.
        </p>

        <h2 className={legalHeading}>Legal basis for processing</h2>
        <p className={legalParagraph}>
          Your consent, given when you voluntarily provide your data.
        </p>

        <h2 className={legalHeading}>Retention periods</h2>
        <p className={legalParagraph}>
          We may access the data that users publish on our social media profile
          for as long as they follow us and do not delete it. Contact details
          provided to request information are not stored.
        </p>

        <h2 className={legalHeading}>
          Recipients and international data transfers
        </h2>
        <p className={legalParagraph}>
          Data is never disclosed to third parties, and no international data
          transfers are planned. When you provide your data on our social media
          profiles, you should be aware that those networks are also data
          controllers and have their own privacy policies. You can consult them
          here:
        </p>
        <p className={legalParagraph}>
          Twitter/X:{" "}
          <a
            href="https://x.com/en/privacy"
            className={legalLink}
            target="_blank"
            rel="noreferrer"
          >
            https://x.com/en/privacy
          </a>
        </p>
        <p className={legalParagraph}>
          LinkedIn:{" "}
          <a
            href="https://www.linkedin.com/legal/privacy-policy"
            className={legalLink}
            target="_blank"
            rel="noreferrer"
          >
            https://www.linkedin.com/legal/privacy-policy
          </a>
        </p>

        <h2 className={legalHeading}>User rights</h2>
        <p className={legalParagraph}>
          You may exercise your rights of access, rectification, erasure and
          objection regarding your data, as well as your rights to restriction of
          processing and data portability, by emailing{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className={legalLink}>
            {CONTACT_EMAIL}
          </a>{" "}
          or by post to the address given above. You must provide proof of your
          identity and use the subject line &ldquo;Data protection&rdquo;.
        </p>
        <p className={legalParagraph}>
          If you are not satisfied with how your personal data is processed, you
          have the right to lodge a complaint with the supervisory authority, the{" "}
          <a
            href="https://www.ctpdandalucia.es/"
            className={legalLink}
            target="_blank"
            rel="noreferrer"
          >
            Andalusian Council for Transparency and Data Protection
          </a>
          .
        </p>
      </div>
    </section>
  );
}

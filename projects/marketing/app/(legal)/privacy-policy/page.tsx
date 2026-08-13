import type { Metadata } from "next";
import { SectionHeading } from "@/components/home/SectionHeading";
import {
  legalHeading,
  legalParagraph,
  legalStrong,
  legalLink,
  legalAddress,
} from "@/components/legal/prose";

export const metadata: Metadata = {
  title: "Política de privacidad — Elemwave",
  description:
    "Cómo Elemwave trata los datos personales conforme al RGPD y a la Ley Orgánica 3/2018, y los derechos que puedes ejercer.",
};

const CONTACT_EMAIL = "info@elemwave.com";

/**
 * The policy text is the approved Spanish original and is published verbatim,
 * so the content column carries `lang="es"` inside the English site.
 */
export default function PrivacyPolicy() {
  return (
    <section className="bg-surface px-[clamp(20px,4vw,56px)] pb-[clamp(56px,8vw,110px)] pt-[clamp(48px,7vw,88px)]">
      <div lang="es" className="mx-auto max-w-[820px]">
        <SectionHeading as="h1" title="Política de privacidad" />

        <p className={`${legalParagraph} mt-10`}>
          En cumplimiento del Reglamento (UE) 2016/679 del Parlamento Europeo y del
          Consejo relativo a la protección de las personas físicas en lo que respecta
          al tratamiento de datos personales y a la libre circulación de los mismos
          (RGPD) y la Ley Orgánica 3/2018 de Protección de datos personales y
          garantía de los derechos digitales, le informamos del tratamiento que se da
          a sus datos personales.
        </p>
        <p className={legalParagraph}>
          En <strong className={legalStrong}>Elemwave</strong> aplicamos las medidas
          de seguridad necesarias para evitar la alteración, pérdida, tratamiento o
          acceso no autorizado de los datos personales, habida cuenta en todo momento
          del estado de la tecnología, así como para proteger sus datos y guardar
          total confidencialidad.
        </p>
        <p className={legalParagraph}>
          De todas formas, el usuario debe ser consciente de que las medidas de
          seguridad en Internet no son inexpugnables. Somos respetuosos en todo caso
          con la voluntad de nuestros contactos en el tratamiento de su información.
          El usuario se hace responsable de la veracidad de la información que nos
          proporcione así como de su actualización. Igualmente será responsable de
          cualquier daño o perjuicio que pudiera derivarse como consecuencia de que
          los datos facilitados sean falsos, inexactos o no se encuentren
          actualizados.
        </p>

        <h2 className={legalHeading}>Datos del responsable</h2>
        <address className={legalAddress}>
          Elemwave
          <br />
          B06913164
          <br />
          Calle Recogidas, 35, 1A
          <br />
          18005 Granada, España
          <br />
          Contacto:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className={legalLink}>
            {CONTACT_EMAIL}
          </a>
        </address>

        <h2 className={legalHeading}>Finalidad</h2>
        <p className={legalParagraph}>
          <strong className={legalStrong}>Contacto</strong>: Solo solicitaremos la
          información imprescindible en cada momento para prestar nuestros servicios
          e informar de novedades y otros contenidos vinculados con la Empresa y que
          puedan ser de su interés.
        </p>
        <p className={legalParagraph}>
          <strong className={legalStrong}>Redes sociales</strong>: Estamos presentes
          en diferentes redes sociales. Puede que facilites datos personales a través
          de nuestro perfil; en ese caso, la finalidad del tratamiento de sus datos es
          interactuar a través de ese medio.
        </p>

        <h2 className={legalHeading}>Base legítima del tratamiento</h2>
        <p className={legalParagraph}>
          Porque nos da el consentimiento al facilitar sus datos voluntariamente.
        </p>

        <h2 className={legalHeading}>Tiempos de conservación</h2>
        <p className={legalParagraph}>
          Podremos acceder a los datos que publiquen en nuestro perfil de redes
          sociales mientras sean seguidores nuestros y no los supriman. Respecto a
          datos de contacto para solicitar información, no se almacenan.
        </p>

        <h2 className={legalHeading}>
          Destinatarios y transferencias internacionales de datos
        </h2>
        <p className={legalParagraph}>
          En ningún caso se ceden datos a terceros y no está previsto hacer
          transferencias internacionales de datos. Cuando facilita sus datos en
          nuestros perfiles de redes sociales, debe ser consciente de que dichas redes
          también son responsables del tratamiento y tienen sus propias políticas de
          privacidad. Puede consultarlas:
        </p>
        <p className={legalParagraph}>
          Twitter/X:{" "}
          <a
            href="https://x.com/es/privacy"
            className={legalLink}
            target="_blank"
            rel="noreferrer"
          >
            https://x.com/es/privacy
          </a>
        </p>
        <p className={legalParagraph}>
          LinkedIn:{" "}
          <a
            href="https://es.linkedin.com/legal/privacy-policy"
            className={legalLink}
            target="_blank"
            rel="noreferrer"
          >
            https://es.linkedin.com/legal/privacy-policy
          </a>
        </p>

        <h2 className={legalHeading}>Derechos de los usuarios</h2>
        <p className={legalParagraph}>
          Puedes ejercer tus derechos de acceso, modificación, supresión y oposición
          de sus datos en el correo electrónico{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className={legalLink}>
            {CONTACT_EMAIL}
          </a>
          , así como ejercitar los derechos de limitación y portabilidad, o mediante
          correo postal a la dirección arriba indicada, debiendo acreditar su
          identidad y poniendo como asunto «Protección de datos».
        </p>
        <p className={legalParagraph}>
          Tiene derecho a presentar una reclamación ante la autoridad de control, el{" "}
          <a
            href="https://www.ctpdandalucia.es/"
            className={legalLink}
            target="_blank"
            rel="noreferrer"
          >
            Consejo de Transparencia y Protección de datos de Andalucía
          </a>
          , si no está conforme con el tratamiento que se hace de sus datos
          personales.
        </p>
      </div>
    </section>
  );
}

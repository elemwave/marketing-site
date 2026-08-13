import type { Metadata } from "next";
import { SectionHeading } from "@/components/home/SectionHeading";
import {
  legalHeading,
  legalParagraph,
  legalList,
  legalStrong,
} from "@/components/legal/prose";

export const metadata: Metadata = {
  title: "Política integrada — Elemwave",
  description:
    "Política Integrada de Gestión del grupo AIRCURY: calidad, medio ambiente, gestión de servicios de TI y seguridad de la información.",
};

/**
 * The policy text is the group's certified Spanish original and is published
 * verbatim, so the content column carries `lang="es"` inside the English site.
 */
export default function IntegratedPolicy() {
  return (
    <section className="bg-surface px-[clamp(20px,4vw,56px)] pb-[clamp(56px,8vw,110px)] pt-[clamp(48px,7vw,88px)]">
      <div lang="es" className="mx-auto max-w-[820px]">
        <SectionHeading as="h1" title="Política integrada" />

        <p className={`${legalParagraph} mt-10`}>
          Elemwave forma parte del grupo AIRCURY. El grupo AIRCURY es un conjunto
          empresarial dedicado al{" "}
          <strong className={legalStrong}>
            diseño, desarrollo, implantación, operación y mantenimiento de
            soluciones software y servicios digitales
          </strong>
          , apoyado en infraestructuras en la nube y en un modelo de trabajo
          mayoritariamente en <strong className={legalStrong}>teletrabajo</strong>,
          prestando servicios a clientes nacionales e internacionales.
        </p>
        <p className={legalParagraph}>
          La Dirección del grupo AIRCURY asume que la{" "}
          <strong className={legalStrong}>calidad de los servicios</strong>, la{" "}
          <strong className={legalStrong}>protección del medio ambiente</strong>, la{" "}
          <strong className={legalStrong}>
            gestión eficaz de los servicios de tecnologías de la información
          </strong>{" "}
          y la{" "}
          <strong className={legalStrong}>seguridad de la información</strong>{" "}
          constituyen elementos estratégicos para la sostenibilidad, la confianza de
          los clientes, el cumplimiento normativo y la continuidad del negocio.
        </p>
        <p className={legalParagraph}>
          Con este propósito, AIRCURY establece y mantiene un{" "}
          <strong className={legalStrong}>Sistema Integrado de Gestión</strong>,
          conforme a las normas{" "}
          <strong className={legalStrong}>
            ISO 9001, ISO 14001, ISO/IEC 20000-1, ISO/IEC 27001
          </strong>{" "}
          y a los requisitos del{" "}
          <strong className={legalStrong}>
            Esquema Nacional de Seguridad (RD 311/2022)
          </strong>
          , comprometiéndose a su implantación, mantenimiento y mejora continua.
        </p>

        <h2 className={legalHeading}>Dirección</h2>
        <p className={legalParagraph}>
          La Dirección del grupo AIRCURY se compromete a:
        </p>
        <ul className={legalList}>
          <li>
            Proporcionar los{" "}
            <strong className={legalStrong}>recursos necesarios</strong> para el
            correcto funcionamiento del Sistema Integrado de Gestión.
          </li>
          <li>
            Garantizar el{" "}
            <strong className={legalStrong}>
              liderazgo, la responsabilidad y la implicación
            </strong>{" "}
            de todos los niveles de la organización.
          </li>
          <li>
            Integrar los principios de calidad, medio ambiente, gestión de servicios
            y seguridad de la información en la{" "}
            <strong className={legalStrong}>
              estrategia y en los procesos de negocio
            </strong>
            .
          </li>
          <li>
            Fomentar una{" "}
            <strong className={legalStrong}>cultura preventiva</strong>, orientada a
            la mejora continua, la gestión de riesgos y la excelencia operativa.
          </li>
        </ul>

        <h2 className={legalHeading}>Calidad</h2>
        <p className={legalParagraph}>
          AIRCURY, en relación a la calidad, se compromete a:
        </p>
        <ul className={legalList}>
          <li>
            Proporcionar{" "}
            <strong className={legalStrong}>
              servicios y soluciones software que satisfagan los requisitos de los
              clientes
            </strong>
            , legales y contractuales aplicables.
          </li>
          <li>
            Garantizar la{" "}
            <strong className={legalStrong}>planificación, control y mejora</strong>{" "}
            de los procesos que soportan la prestación del servicio.
          </li>
          <li>
            Medir y analizar el{" "}
            <strong className={legalStrong}>
              desempeño de los procesos y la satisfacción del cliente
            </strong>{" "}
            como base para la mejora continua.
          </li>
          <li>
            Gestionar los riesgos y oportunidades que puedan afectar a la calidad de
            los servicios prestados.
          </li>
        </ul>

        <h2 className={legalHeading}>Medio ambiente</h2>
        <p className={legalParagraph}>
          AIRCURY asume su responsabilidad con la protección del medio ambiente y se
          compromete a:
        </p>
        <ul className={legalList}>
          <li>
            Cumplir la{" "}
            <strong className={legalStrong}>legislación ambiental aplicable</strong>{" "}
            y otros requisitos suscritos por la organización.
          </li>
          <li>
            Prevenir la contaminación y{" "}
            <strong className={legalStrong}>
              minimizar los impactos ambientales
            </strong>{" "}
            derivados de su actividad, especialmente los asociados al uso de recursos
            tecnológicos y energéticos.
          </li>
          <li>
            Promover un{" "}
            <strong className={legalStrong}>uso eficiente de los recursos</strong>,
            la reducción de consumos y la correcta gestión de residuos.
          </li>
          <li>
            Integrar la perspectiva ambiental en la toma de decisiones y en la mejora
            continua del sistema de gestión.
          </li>
        </ul>

        <h2 className={legalHeading}>Servicios de IT</h2>
        <p className={legalParagraph}>
          AIRCURY, en cuanto a servicios de IT, se compromete a:
        </p>
        <ul className={legalList}>
          <li>
            Planificar, diseñar, entregar, operar y mejorar los{" "}
            <strong className={legalStrong}>
              servicios de tecnologías de la información
            </strong>{" "}
            de forma controlada y coherente con las necesidades del negocio y de los
            clientes.
          </li>
          <li>
            Definir y mantener{" "}
            <strong className={legalStrong}>acuerdos de nivel de servicio</strong>,
            procesos de soporte y mecanismos de seguimiento del desempeño.
          </li>
          <li>
            Gestionar adecuadamente los{" "}
            <strong className={legalStrong}>
              incidentes, problemas, cambios y continuidades
            </strong>{" "}
            del servicio.
          </li>
          <li>
            Asegurar la alineación entre la gestión de servicios TI y los objetivos
            estratégicos de la organización.
          </li>
        </ul>

        <h2 className={legalHeading}>Seguridad de la información</h2>
        <p className={legalParagraph}>
          AIRCURY reconoce que la información y los sistemas que la soportan son
          activos críticos y se compromete a:
        </p>
        <ul className={legalList}>
          <li>
            Proteger la{" "}
            <strong className={legalStrong}>
              confidencialidad, integridad, disponibilidad, autenticidad y
              trazabilidad
            </strong>{" "}
            de la información.
          </li>
          <li>
            Cumplir con los requisitos de{" "}
            <strong className={legalStrong}>ISO/IEC 27001:2022</strong> y del{" "}
            <strong className={legalStrong}>Esquema Nacional de Seguridad</strong>,
            conforme al alcance y nivel de categorización definidos.
          </li>
          <li>
            Aplicar un{" "}
            <strong className={legalStrong}>enfoque basado en riesgos</strong> para
            identificar, evaluar y tratar las amenazas que puedan afectar a la
            información y a los servicios.
          </li>
          <li>
            Implementar controles técnicos, organizativos y procedimentales adecuados
            para prevenir incidentes de seguridad y responder eficazmente ante ellos.
          </li>
          <li>
            Garantizar la{" "}
            <strong className={legalStrong}>
              continuidad de los servicios y la resiliencia
            </strong>{" "}
            de los sistemas de información.
          </li>
        </ul>

        <h2 className={legalHeading}>Equipo humano</h2>
        <p className={legalParagraph}>
          El grupo AIRCURY y su equipo humano se compromete a:
        </p>
        <ul className={legalList}>
          <li>
            Garantizar la{" "}
            <strong className={legalStrong}>competencia y formación</strong> del
            personal en relación con la calidad, el medio ambiente, la gestión de
            servicios y la seguridad de la información.
          </li>
          <li>
            Fomentar la{" "}
            <strong className={legalStrong}>
              concienciación y responsabilidad individual
            </strong>{" "}
            en el cumplimiento de las políticas, normas y procedimientos
            establecidos.
          </li>
          <li>
            Promover la participación activa del personal en la mejora del Sistema
            Integrado de Gestión.
          </li>
        </ul>

        <h2 className={legalHeading}>Compliance</h2>
        <p className={legalParagraph}>
          La dirección de compliance de AIRCURY se compromete a:
        </p>
        <ul className={legalList}>
          <li>
            Identificar y cumplir los{" "}
            <strong className={legalStrong}>
              requisitos legales, reglamentarios y contractuales
            </strong>{" "}
            aplicables a su actividad.
          </li>
          <li>
            Evaluar periódicamente el desempeño del Sistema Integrado de Gestión
            mediante{" "}
            <strong className={legalStrong}>
              seguimiento, medición, auditorías internas y revisiones por la
              Dirección
            </strong>
            .
          </li>
          <li>
            Aplicar acciones correctivas y de mejora que permitan aumentar la{" "}
            <strong className={legalStrong}>
              eficacia, eficiencia y madurez
            </strong>{" "}
            del sistema.
          </li>
          <li>
            Mantener esta Política como marco de referencia para el establecimiento
            de objetivos y planes de mejora.
          </li>
        </ul>

        <p className={legalParagraph}>
          La presente{" "}
          <strong className={legalStrong}>
            Política Integrada de Gestión
          </strong>{" "}
          es comunicada a todo el personal y a las partes interesadas pertinentes,
          estando disponible para su consulta.
        </p>
        <p className={legalParagraph}>
          La Política será revisada periódicamente, y siempre que se produzcan
          cambios significativos en la organización, la actividad, el contexto o los
          requisitos aplicables.
        </p>
      </div>
    </section>
  );
}

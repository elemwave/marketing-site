import { SectionHeading } from "@/components/home/SectionHeading";
import {
  legalHeading,
  legalParagraph,
  legalList,
  legalStrong,
} from "@/components/legal/prose";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata({
  // The root layout's title template appends the brand.
  title: "Integrated policy",
  description:
    "The AIRCURY group's Integrated Management Policy: quality, the environment, IT service management and information security.",
  path: "/integrated-policy",
});

/**
 * An English translation of the group's certified Spanish policy.
 */
export default function IntegratedPolicy() {
  return (
    <section className="bg-surface px-[clamp(20px,4vw,56px)] pb-[clamp(56px,8vw,110px)] pt-[clamp(48px,7vw,88px)]">
      <div className="mx-auto max-w-[820px]">
        <SectionHeading as="h1" title="Integrated policy" />

        <p className={`${legalParagraph} mt-10`}>
          Elemwave is part of the AIRCURY group. The AIRCURY group is a business
          group dedicated to the{" "}
          <strong className={legalStrong}>
            design, development, implementation, operation and maintenance of
            software solutions and digital services
          </strong>
          , supported by cloud infrastructure and a working model that is
          predominantly <strong className={legalStrong}>remote</strong>, providing
          services to clients in Spain and abroad.
        </p>
        <p className={legalParagraph}>
          The management of the AIRCURY group recognises that the{" "}
          <strong className={legalStrong}>quality of its services</strong>,{" "}
          <strong className={legalStrong}>protection of the environment</strong>,{" "}
          <strong className={legalStrong}>
            effective management of information technology services
          </strong>{" "}
          and <strong className={legalStrong}>information security</strong> are
          strategic elements for sustainability, client trust, regulatory
          compliance and business continuity.
        </p>
        <p className={legalParagraph}>
          To that end, AIRCURY establishes and maintains an{" "}
          <strong className={legalStrong}>Integrated Management System</strong>{" "}
          in accordance with the{" "}
          <strong className={legalStrong}>
            ISO 9001, ISO 14001, ISO/IEC 20000-1 and ISO/IEC 27001
          </strong>{" "}
          standards and the requirements of Spain&apos;s{" "}
          <strong className={legalStrong}>
            National Security Framework (Esquema Nacional de Seguridad, Royal
            Decree 311/2022)
          </strong>
          , and commits to its implementation, maintenance and continual
          improvement.
        </p>

        <h2 className={legalHeading}>Management</h2>
        <p className={legalParagraph}>
          The management of the AIRCURY group commits to:
        </p>
        <ul className={legalList}>
          <li>
            Providing the{" "}
            <strong className={legalStrong}>resources required</strong> for the
            Integrated Management System to operate properly.
          </li>
          <li>
            Ensuring{" "}
            <strong className={legalStrong}>
              leadership, accountability and engagement
            </strong>{" "}
            at every level of the organisation.
          </li>
          <li>
            Integrating the principles of quality, the environment, service
            management and information security into the{" "}
            <strong className={legalStrong}>
              strategy and business processes
            </strong>
            .
          </li>
          <li>
            Fostering a{" "}
            <strong className={legalStrong}>culture of prevention</strong>,
            focused on continual improvement, risk management and operational
            excellence.
          </li>
        </ul>

        <h2 className={legalHeading}>Quality</h2>
        <p className={legalParagraph}>
          With regard to quality, AIRCURY commits to:
        </p>
        <ul className={legalList}>
          <li>
            Providing{" "}
            <strong className={legalStrong}>
              services and software solutions that meet client requirements
            </strong>{" "}
            and applicable legal and contractual requirements.
          </li>
          <li>
            Ensuring the{" "}
            <strong className={legalStrong}>
              planning, control and improvement
            </strong>{" "}
            of the processes that support service delivery.
          </li>
          <li>
            Measuring and analysing{" "}
            <strong className={legalStrong}>
              process performance and client satisfaction
            </strong>{" "}
            as the basis for continual improvement.
          </li>
          <li>
            Managing the risks and opportunities that may affect the quality of
            the services provided.
          </li>
        </ul>

        <h2 className={legalHeading}>Environment</h2>
        <p className={legalParagraph}>
          AIRCURY accepts its responsibility for protecting the environment and
          commits to:
        </p>
        <ul className={legalList}>
          <li>
            Complying with{" "}
            <strong className={legalStrong}>
              applicable environmental legislation
            </strong>{" "}
            and other requirements to which the organisation subscribes.
          </li>
          <li>
            Preventing pollution and{" "}
            <strong className={legalStrong}>
              minimising the environmental impact
            </strong>{" "}
            of its activity, particularly that associated with the use of
            technological and energy resources.
          </li>
          <li>
            Promoting the{" "}
            <strong className={legalStrong}>efficient use of resources</strong>,
            reduced consumption and the proper management of waste.
          </li>
          <li>
            Integrating environmental considerations into decision-making and the
            continual improvement of the management system.
          </li>
        </ul>

        <h2 className={legalHeading}>IT services</h2>
        <p className={legalParagraph}>
          With regard to IT services, AIRCURY commits to:
        </p>
        <ul className={legalList}>
          <li>
            Planning, designing, delivering, operating and improving{" "}
            <strong className={legalStrong}>
              information technology services
            </strong>{" "}
            in a controlled manner, consistent with the needs of the business and
            its clients.
          </li>
          <li>
            Defining and maintaining{" "}
            <strong className={legalStrong}>service level agreements</strong>,
            support processes and mechanisms for monitoring performance.
          </li>
          <li>
            Properly managing service{" "}
            <strong className={legalStrong}>
              incidents, problems, changes and continuity
            </strong>
            .
          </li>
          <li>
            Ensuring that IT service management is aligned with the
            organisation&apos;s strategic objectives.
          </li>
        </ul>

        <h2 className={legalHeading}>Information security</h2>
        <p className={legalParagraph}>
          AIRCURY recognises that information and the systems that support it are
          critical assets, and commits to:
        </p>
        <ul className={legalList}>
          <li>
            Protecting the{" "}
            <strong className={legalStrong}>
              confidentiality, integrity, availability, authenticity and
              traceability
            </strong>{" "}
            of information.
          </li>
          <li>
            Complying with the requirements of{" "}
            <strong className={legalStrong}>ISO/IEC 27001:2022</strong> and the{" "}
            <strong className={legalStrong}>National Security Framework</strong>,
            in line with the defined scope and categorisation level.
          </li>
          <li>
            Applying a{" "}
            <strong className={legalStrong}>risk-based approach</strong> to
            identify, assess and treat threats that may affect information and
            services.
          </li>
          <li>
            Implementing appropriate technical, organisational and procedural
            controls to prevent security incidents and respond to them
            effectively.
          </li>
          <li>
            Ensuring the{" "}
            <strong className={legalStrong}>
              continuity of services and the resilience
            </strong>{" "}
            of information systems.
          </li>
        </ul>

        <h2 className={legalHeading}>People</h2>
        <p className={legalParagraph}>
          The AIRCURY group and its people commit to:
        </p>
        <ul className={legalList}>
          <li>
            Ensuring the{" "}
            <strong className={legalStrong}>competence and training</strong> of
            staff in quality, the environment, service management and information
            security.
          </li>
          <li>
            Fostering{" "}
            <strong className={legalStrong}>
              awareness and individual responsibility
            </strong>{" "}
            for complying with the established policies, standards and
            procedures.
          </li>
          <li>
            Promoting the active participation of staff in improving the
            Integrated Management System.
          </li>
        </ul>

        <h2 className={legalHeading}>Compliance</h2>
        <p className={legalParagraph}>
          AIRCURY&apos;s compliance function commits to:
        </p>
        <ul className={legalList}>
          <li>
            Identifying and complying with the{" "}
            <strong className={legalStrong}>
              legal, regulatory and contractual requirements
            </strong>{" "}
            applicable to its activity.
          </li>
          <li>
            Periodically evaluating the performance of the Integrated Management
            System through{" "}
            <strong className={legalStrong}>
              monitoring, measurement, internal audits and management reviews
            </strong>
            .
          </li>
          <li>
            Applying corrective and improvement actions that increase the{" "}
            <strong className={legalStrong}>
              effectiveness, efficiency and maturity
            </strong>{" "}
            of the system.
          </li>
          <li>
            Maintaining this Policy as the frame of reference for setting
            objectives and improvement plans.
          </li>
        </ul>

        <p className={legalParagraph}>
          This{" "}
          <strong className={legalStrong}>Integrated Management Policy</strong> is
          communicated to all staff and relevant interested parties, and is
          available for consultation.
        </p>
        <p className={legalParagraph}>
          The Policy will be reviewed periodically, and whenever there are
          significant changes to the organisation, its activity, its context or
          the applicable requirements.
        </p>
      </div>
    </section>
  );
}

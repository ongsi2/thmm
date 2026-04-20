import CodeBlock from '../_components/CodeBlock';
import { cases, organizations } from '../_components/cases';
import {
  CaseHero,
  CaseSection,
  InsightList,
  ProcessSteps,
  OtherCases,
} from '../_components/CaseShell';
import { Pipeline } from '../_components/diagrams/Pipeline';
import { MetricBar } from '../_components/diagrams/MetricBar';

const jenkinsfile = `// Jenkins Declarative Pipeline - GitLab Webhook 연동 자동 배포
pipeline {
    agent any

    triggers {
        GenericTrigger(
            genericVariables: [
                [key: 'BRANCH_NAME', value: '$.ref'],
                [key: 'EVENT_TYPE',  value: '$.event_name']
            ],
            regexpFilterExpression: '^refs/heads/devtest push$'
        )
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'devtest',
                    credentialsId: 'gitlab-ssh-key',
                    url: 'ssh://git@server/gitlab/goad.git'
            }
        }

        stage('Build') {
            steps {
                sh 'mvn clean package -P staging'
            }
        }

        stage('Deploy') {
            steps {
                sshPublisher(publishers: [
                    sshPublisherDesc(
                        configName: 'staging-server',
                        transfers: [sshTransfer(
                            sourceFiles: 'target/issga.war',
                            execCommand: '/home/deploy/deploy.sh'
                        )]
                    )
                ])
            }
        }
    }
}`;

export default function CicdContentEn() {
  return (
    <main>
      <CaseHero
        organization={organizations['kpf-issga']}
        category="CI/CD"
        title="Automating the Build and Deploy Pipeline"
        subtitle="I replaced a fully manual dev-server deploy — build, transfer, restart, all done by hand — with a Jenkins pipeline. Push to GitLab and the build-and-deploy runs on its own."
        meta={[
          { label: 'Deploy time', value: '20 min → 4 min', hint: '~80% reduction' },
          { label: 'Automation scope', value: '3 stages', hint: 'Checkout · Build · Deploy' },
          { label: 'Trigger', value: 'GitLab Webhook', hint: 'Branch-based auto-detection' },
          { label: 'Infrastructure', value: 'Docker + Jenkins', hint: 'Declarative Pipeline' },
        ]}
        stack={['Jenkins', 'GitLab', 'Docker', 'Maven', 'Declarative Pipeline', 'SSH']}
      />

      <CaseSection eyebrow="Problem" title="15–20 minutes per deploy, zero traceability" accent="problem">
        <p>
          Dev-server deployments were entirely manual — build, transfer, restart, all done by hand.
          A single deploy took 15–20 minutes, during which other developers were stuck waiting, and
          there was no record anywhere of who deployed what and when. With frequent deploys, a
          mistyped command or a wrong-environment slip would creep in from time to time, and each
          one added a rollback-and-redeploy overhead on top.
        </p>
        <InsightList
          items={[
            { title: '15–20 min per deploy on average', detail: 'Build, transfer, and restart all run manually in sequence' },
            { title: 'No way to trace deploy history', detail: 'No record of who deployed what and when' },
            { title: 'Blocking wait time', detail: 'Other work would stall while a deploy was in progress' },
            { title: 'Human errors during manual work', detail: 'Typos or wrong-environment mix-ups occasionally caused incidents' },
          ]}
        />
      </CaseSection>

      <CaseSection eyebrow="Approach" title="A CI/CD pipeline built on Jenkins" accent="approach">
        <p>
          Using a Jenkins Declarative Pipeline, I defined the whole build-and-deploy procedure in a
          single Jenkinsfile. A GitLab Webhook detects pushes to a specific branch, and the
          Checkout → Build → Deploy stages run in sequence.
        </p>

        <div className="mt-8">
          <Pipeline
            groups={[
              {
                title: 'Trigger',
                steps: [
                  { label: 'Developer', sub: 'git push devtest' },
                  { label: 'GitLab', sub: 'Webhook dispatch' },
                ],
              },
              {
                title: 'Jenkins Pipeline',
                steps: [
                  { label: 'Checkout', sub: 'git clone', badge: '01', tone: 'accent' },
                  { label: 'Build', sub: 'mvn clean package', badge: '02', tone: 'accent' },
                  { label: 'Deploy', sub: 'SSH + deploy.sh', badge: '03', tone: 'accent' },
                ],
              },
              {
                title: 'Target',
                steps: [{ label: 'Staging Server', sub: 'WAR deploy + WAS restart' }],
              },
            ]}
          />
        </div>

        <div className="mt-8">
          <MetricBar
            caption="Average time per deploy"
            unit="min"
            rows={[
              { label: 'Before · manual', value: 20, display: '15 – 20 min', tone: 'danger' },
              { label: 'After · automated', value: 4, display: '4 min', tone: 'accent' },
            ]}
          />
          <p className="mt-3 text-center text-sm font-mono text-[var(--color-text-muted)]">
            ▼ ~<span className="text-[var(--color-accent-dark)] font-bold">80% reduction</span>
          </p>
        </div>
      </CaseSection>

      <CaseSection eyebrow="Process" title="Implementation steps" accent="process">
        <ProcessSteps
          steps={[
            {
              title: 'Run Jenkins in a Docker container',
              body: (
                <p>
                  To avoid messing up the host environment, I ran Jenkins inside a Docker container.
                  Jobs, plugins, and credentials were split out to volumes, so the configuration
                  survives restarts intact.
                </p>
              ),
            },
            {
              title: 'Connect the GitLab Webhook',
              body: (
                <p>
                  Push events from the GitLab repository are forwarded to Jenkins, and a{' '}
                  <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">regexpFilterExpression</code>{' '}
                  filters them so the build only runs for pushes to the devtest branch.
                </p>
              ),
            },
            {
              title: 'Write the Jenkinsfile',
              body: (
                <>
                  <p>
                    I split the pipeline into Checkout → Build → Deploy stages, so if something
                    fails it is immediately obvious which stage stopped. Deploy ships the WAR file
                    over SSH and then runs the server-side{' '}
                    <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">deploy.sh</code>{' '}
                    to handle the WAS restart — all in one go.
                  </p>
                  <CodeBlock filename="Jenkinsfile" language="groovy" code={jenkinsfile} />
                </>
              ),
            },
            {
              title: 'Surface build status on GitLab commits',
              body: (
                <p>
                  Build results are reported back as GitLab commit statuses, so when you look at a
                  commit in GitLab you can immediately see whether the build succeeded, failed, or
                  is still running.
                </p>
              ),
            },
          ]}
        />
      </CaseSection>

      <CaseSection eyebrow="Outcome" title="Results and takeaways" accent="outcome">
        <InsightList
          variant="outcome"
          items={[
            {
              title: 'Deploy time: 20 min → 4 min',
              detail: 'Work that used to take 15–20 minutes manually dropped to around 4 minutes with the automated pipeline.',
            },
            {
              title: 'Manual mistakes disappeared',
              detail: 'The kinds of errors that came from manual steps — command typos, wrong-environment mix-ups — are now virtually gone.',
            },
            {
              title: 'No more blocking wait time',
              detail: 'Once a push goes out, developers can move straight on to the next task while the pipeline runs.',
            },
            {
              title: 'Pipeline beat Freestyle',
              detail:
                'I first tried a Freestyle Job, but Pipeline turned out to be far better for traceability, reuse, and extensibility. It really drove home why capturing the procedure as code matters.',
            },
          ]}
        />
      </CaseSection>

      <OtherCases current="cicd" all={cases} />
    </main>
  );
}

import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: '빌드·배포 프로세스 자동화',
  description:
    'Jenkins 파이프라인과 GitLab Webhook 연동으로 수동 배포를 완전 자동화하고, 평균 배포 시간을 약 80% 단축한 케이스 스터디.',
  alternates: { canonical: 'https://thmm.kr/portfolio/cicd' },
};

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

export default function CicdCase() {
  return (
    <main>
      <CaseHero
        organization={organizations['kpf-issga']}
        category="CI/CD"
        title="빌드·배포 프로세스 자동화"
        subtitle="빌드부터 재기동까지 전부 수동으로 하던 개발 서버 배포를, Jenkins 파이프라인으로 자동화했습니다. GitLab에 푸시하면 알아서 빌드·배포가 돌아갑니다."
        meta={[
          { label: '배포 시간', value: '20분 → 4분', hint: '약 80% 단축' },
          { label: '자동화 범위', value: '3단계', hint: 'Checkout · Build · Deploy' },
          { label: '트리거', value: 'GitLab Webhook', hint: '브랜치 기반 자동 감지' },
          { label: '인프라', value: 'Docker + Jenkins', hint: 'Declarative Pipeline' },
        ]}
        stack={['Jenkins', 'GitLab', 'Docker', 'Maven', 'Declarative Pipeline', 'SSH']}
      />

      <CaseSection eyebrow="Problem" title="배포 한 번에 15~20분, 이력도 추적 불가" accent="problem">
        <p>
          개발 서버 배포가 빌드부터 전송·재기동까지 전부 사람 손으로 돌아가고 있었습니다. 한 번 배포하는 데 15~20분
          — 그 시간 동안 다른 개발자들도 같이 눈치 보면서 기다렸고, 누가 언제 뭘 배포했는지 기록은 어디에도 안
          남았습니다. 자주 배포하다 보면 명령어 오타나 환경 착각 같은 실수가 한 번씩 섞이고, 그럴 때마다 롤백·재배포
          오버헤드가 덤으로 붙었습니다.
        </p>
        <InsightList
          items={[
            { title: '배포 1회 평균 15~20분', detail: '빌드·전송·재기동을 순서대로 직접 수행' },
            { title: '배포 이력 추적 불가', detail: '누가 언제 뭘 배포했는지 확인 방법 없음' },
            { title: '대기 시간 발생', detail: '배포 중에는 다른 작업도 같이 멈춤' },
            { title: '수동 작업 실수', detail: '명령어 오타·환경 착각으로 장애가 간혹 발생' },
          ]}
        />
      </CaseSection>

      <CaseSection eyebrow="Approach" title="Jenkins 파이프라인 기반 CI/CD 구축" accent="approach">
        <p>
          Jenkins Declarative Pipeline을 써서 빌드·배포 절차를 Jenkinsfile 하나에 정의했습니다. GitLab Webhook으로
          특정 브랜치 푸시를 감지하고, Checkout → Build → Deploy 단계가 순차적으로 실행되도록 구성했습니다.
        </p>

        <div className="mt-8">
          <Pipeline
            groups={[
              {
                title: 'Trigger',
                steps: [
                  { label: 'Developer', sub: 'git push devtest' },
                  { label: 'GitLab', sub: 'Webhook 송신' },
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
                steps: [{ label: 'Staging Server', sub: 'WAR 배포 + WAS 재기동' }],
              },
            ]}
          />
        </div>

        <div className="mt-8">
          <MetricBar
            caption="배포 1회 평균 소요 시간"
            unit="분"
            rows={[
              { label: 'Before · 수동', value: 20, display: '15 ~ 20분', tone: 'danger' },
              { label: 'After · 자동화', value: 4, display: '4분', tone: 'accent' },
            ]}
          />
          <p className="mt-3 text-center text-sm font-mono text-[var(--color-text-muted)]">
            ▼ 약 <span className="text-[var(--color-accent-dark)] font-bold">80% 단축</span>
          </p>
        </div>
      </CaseSection>

      <CaseSection eyebrow="Process" title="구현 단계" accent="process">
        <ProcessSteps
          steps={[
            {
              title: 'Jenkins를 Docker 컨테이너로 띄우기',
              body: (
                <p>
                  호스트 환경이 꼬이는 걸 피하려고 Jenkins를 Docker 컨테이너로 돌렸습니다. 작업·플러그인·자격증명은
                  볼륨으로 분리해서 재기동해도 설정이 그대로 유지되도록 구성했습니다.
                </p>
              ),
            },
            {
              title: 'GitLab Webhook 연결',
              body: (
                <p>
                  GitLab 저장소의 푸시 이벤트를 Jenkins로 넘겨받고, <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">regexpFilterExpression</code>으로
                  devtest 브랜치 푸시만 걸러서 빌드가 돌아가도록 필터링했습니다.
                </p>
              ),
            },
            {
              title: 'Jenkinsfile 작성',
              body: (
                <>
                  <p>
                    Checkout → Build → Deploy 단계를 나눠 두어, 실패가 생기면 어느 단계에서 멈췄는지 바로 보이도록
                    했습니다. Deploy는 SSH로 WAR 파일을 보낸 뒤 서버측 <code className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-[var(--color-bg-off)] border border-[var(--color-border)]">deploy.sh</code>를
                    실행해서 WAS 재기동까지 한 번에 처리합니다.
                  </p>
                  <CodeBlock filename="Jenkinsfile" language="groovy" code={jenkinsfile} />
                </>
              ),
            },
            {
              title: 'GitLab 커밋에 빌드 상태 표시',
              body: (
                <p>
                  빌드 결과를 GitLab 커밋 상태로 되돌려 줘서, GitLab에서 커밋을 보면 빌드 성공/실패/진행 중 여부를
                  바로 확인할 수 있도록 했습니다.
                </p>
              ),
            },
          ]}
        />
      </CaseSection>

      <CaseSection eyebrow="Outcome" title="결과와 배운 것" accent="outcome">
        <InsightList
          variant="outcome"
          items={[
            {
              title: '배포 시간 20분 → 4분',
              detail: '수동 15~20분 걸리던 작업이 자동 파이프라인으로 4분대까지 줄었습니다.',
            },
            {
              title: '수동 작업 실수가 사라짐',
              detail: '명령어 오타, 환경 착각처럼 사람이 개입해서 나던 실수들이 거의 없어졌습니다.',
            },
            {
              title: '대기 시간 없이 다음 작업으로',
              detail: '푸시하고 나면 파이프라인이 돌아가는 동안 개발자들은 바로 다음 작업으로 넘어갈 수 있습니다.',
            },
            {
              title: 'Freestyle보다 Pipeline이 맞았다',
              detail:
                '처음에는 Freestyle Job으로 시도했는데, 추적·재사용·확장 모두 Pipeline 쪽이 훨씬 편했습니다. 절차를 코드로 남기는 게 왜 중요한지 실감했습니다.',
            },
          ]}
        />
      </CaseSection>

      <OtherCases current="cicd" all={cases} />
    </main>
  );
}

import React from 'react';

interface LegalPageProps {
  type: 'termos' | 'privacidade' | 'transparencia';
  onNavigate: (path: string) => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ type, onNavigate }) => {
  const documents = {
    termos: {
      title: 'Termos de Uso e Contratação',
      updatedAt: 'Atualizado em 5 de outubro de 2026',
      intro:
        'Estes Termos de Uso e Contratação regem o acesso e a utilização dos serviços, plataformas digitais, conteúdos e assinaturas fornecidos pelo Cérebro Central.',
      sections: [
        {
          num: '1. Aceite e Âmbito',
          text: 'Ao acessar a plataforma Cérebro Central ou subscrever qualquer um de nossos planos, você concorda expressamente e sem reservas com a totalidade das condições aqui estipuladas.'
        },
        {
          num: '2. Elegibilidade e Cadastro',
          text: 'O acesso a áreas de assinantes e contratação é restrito a indivíduos civilmente capazes maiores de 18 anos. O cadastro é pessoal e intransferível.'
        },
        {
          num: '3. Objeto e Disponibilidade',
          text: 'A plataforma disponibiliza acesso a galerias digitais, publicações autorais, ensaios fotográficos e transmissões multimídia operadas sob infraestrutura de alta disponibilidade.'
        },
        {
          num: '4. Conta e Contratação de Planos',
          text: 'Os planos mensal e anual são renovados automaticamente a cada ciclo. O cancelamento pode ser efetuado a qualquer momento sem incidência de multas retroativas.'
        },
        {
          num: '5. Conteúdo do Usuário e IA',
          text: 'Comentários e feedbacks submetidos pelos usuários devem respeitar a integridade da comunidade e a legislação vigente, passando por moderação ativa antes da divulgação.'
        },
        {
          num: '6. Integrações e Uso Aceitável',
          text: 'É terminantemente proibido o uso de robôs, scrapers não autorizados ou mecanismos que sobrecarreguem artificialmente a infraestrutura de borda da plataforma.'
        },
        {
          num: '7. Propriedade Intelectual',
          text: 'Todas as mídias, ensaios, fotografias, logotipos e marcas do Cérebro Central são protegidos pelas leis internacionais de direitos autorais e propriedade industrial.'
        },
        {
          num: '8. Segurança e Privacidade',
          text: 'A biometria facial utilizada pelo Face ID é processada com segurança avançada, sem retenção indevida de dados brutos que violem os padrões de privacidade.'
        },
        {
          num: '9. Responsabilidade e Indenização',
          text: 'O usuário responderá por quaisquer prejuízos causados ao Cérebro Central ou a terceiros decorrentes do descumprimento destes termos.'
        },
        {
          num: '10. Encerramento e Rescisão',
          text: 'Reservamo-nos o direito de suspender ou encerrar contas que violem deliberadamente as políticas comunitárias ou tentem burlar controles de acesso.'
        },
        {
          num: '11. Conformidade Internacional',
          text: 'A plataforma opera em conformidade com as diretrizes da LGPD (Brasil), GDPR (União Europeia) e regulamentações pertinentes de comércio digital.'
        },
        {
          num: '12. Alterações dos Termos',
          text: 'Eventuais modificações relevantes nestes termos serão comunicadas na plataforma com antecedência mínima razoável.'
        },
        {
          num: '13. Foro e Canais de Contato',
          text: 'Para dirimir dúvidas ou controvérsias decorrentes deste contrato, fica eleito o foro da comarca de São Paulo/SP, com renúncia a qualquer outro.'
        }
      ]
    },
    privacidade: {
      title: 'Política de Privacidade',
      updatedAt: 'Atualizado em 5 de outubro de 2026',
      intro:
        'A sua privacidade é prioritária. Esta Política descreve como coletamos, tratamos, armazenamos e protegemos os seus dados pessoais ao navegar no Cérebro Central.',
      sections: [
        {
          num: '1. Dados Coletados',
          text: 'Coletamos apenas as informações estritamente necessárias para a prestação do serviço: endereço de e-mail, nome de exibição, dados técnicos da requisição e verificação biométrica.'
        },
        {
          num: '2. Finalidade do Tratamento',
          text: 'Seus dados são utilizados exclusivamente para autenticação, processamento de assinaturas, suporte técnico e melhoria contínua da experiência de uso.'
        },
        {
          num: '3. Bases Legais e Direitos do Titular',
          text: 'O tratamento fundamenta-se na execução do contrato e no consentimento expressado pelo usuário, nos termos da Lei Geral de Proteção de Dados (LGPD).'
        },
        {
          num: '4. Compartilhamento Restrito',
          text: 'Não vendemos nem compartilhamos seus dados com terceiros para fins de marketing. O compartilhamento ocorre apenas com processadores de pagamento e provedores de infraestrutura de borda sob sigilo.'
        },
        {
          num: '5. Inteligência Artificial e Conteúdo',
          text: 'Mecanismos de IA e moderação de conteúdo operam exclusivamente para proteção anti-bot e filtragem de abusos sem expor sua identidade pessoal.'
        },
        {
          num: '6. Política de Cookies',
          text: 'Utilizamos cookies essenciais de sessão e preferências de idioma. Você pode gerenciar seu consentimento a qualquer instante no painel da plataforma.'
        },
        {
          num: '7. Retenção e Descarte',
          text: 'Seus dados são mantidos enquanto sua conta estiver ativa ou pelo período necessário ao cumprimento de obrigações legais.'
        },
        {
          num: '8. Segurança e Gestão de Incidentes',
          text: 'Adotamos criptografia TLS 1.3, firewalls de aplicação Web (WAF) e protocolos de isolamento de banco de dados na edge.'
        },
        {
          num: '9. Transferências Internacionais',
          text: 'A infraestrutura de borda pode processar requisições em nós de computação globais mantendo salvaguardas equivalentes de segurança.'
        },
        {
          num: '10. Crianças e Adolescentes',
          text: 'A plataforma não é direcionada a menores de 18 anos e não coleta intencionalmente dados de crianças ou adolescentes.'
        },
        {
          num: '11. Exercício de Direitos',
          text: 'Você pode solicitar a confirmação, correção, anonimização ou exclusão dos seus dados entrando em contato pelo e-mail suporte@cerebrocentral.com.'
        },
        {
          num: '12. Atualizações e Contato',
          text: 'Esta política pode ser atualizada periodicamente. As versões revistas entrarão em vigor a partir da data de publicação.'
        }
      ]
    },
    transparencia: {
      title: 'Política de Transparência Avançada',
      updatedAt: 'Atualizado em 5 de outubro de 2026',
      intro:
        'O Cérebro Central rege suas operações sob o princípio da transparência pública, esclarecendo critérios de moderação, tecnologias adotadas e garantias aos usuários.',
      sections: [
        {
          num: '1. Escopo e Compromisso',
          text: 'Este documento assegura a clareza sobre como são operadas as rotas públicas, os serviços de assinatura e a governança de dados da plataforma.'
        },
        {
          num: '2. Inteligência Artificial e Revisão Humana',
          text: 'Sistemas automáticos de integridade trabalham em conjunto com revisores humanos dedicados à moderação de comentários e avaliações.'
        },
        {
          num: '3. Provedores e Infraestrutura',
          text: 'A infraestrutura utiliza o ecossistema Cloudflare Edge (Workers, D1 e R2), garantindo que dados e mídias não fiquem vulneráveis em servidores centrais desprotegidos.'
        },
        {
          num: '4. Pagamentos e Conteúdo Digital',
          text: 'Todas as liquidações financeiras são auditadas por gateways credenciados (Google Pay, Apple Pay e Mercado Pago/PIX), sem custódia de dados bancários pelo Cérebro Central.'
        },
        {
          num: '5. Logs e Segurança de Acesso',
          text: 'Registros técnicos de acesso são mantidos de forma anonimizada apenas pelo prazo legal necessário para prevenção a fraudes.'
        },
        {
          num: '6. Cookies e Analytics',
          text: 'Não utilizamos rastreadores invasivos de terceiros que sigam a navegação do usuário fora do domínio cerebrocentral.com.'
        },
        {
          num: '7. Moderação Comunitária',
          text: 'Avaliações recebidas são aprovadas com base em critérios objetivos de autenticidade, civilidade e respeito mútuo.'
        },
        {
          num: '8. Limites e Disponibilidade de Serviço',
          text: 'A plataforma opera com SLA de alta disponibilidade, realizando manutenções preventivas sem interrupção abrupta aos assinantes.'
        },
        {
          num: '9. Solicitações e Contestação',
          text: 'Qualquer usuário ou membro pode solicitar esclarecimentos ou contestar moderações através de nosso canal formal de suporte.'
        }
      ]
    }
  }[type];

  return (
    <article className="w-full min-h-[calc(100vh-59px-200px)] bg-[#090A0C] font-serif py-14 px-4 sm:px-8">
      <div className="max-w-[1000px] mx-auto space-y-10">
        {/* Document Header */}
        <div className="border-b border-white/[0.08] pb-8 space-y-3">
          <h1 className="text-3xl sm:text-[45px] font-bold text-[#F5F7FA] leading-tight">
            {documents.title}
          </h1>
          <p className="text-xs sm:text-sm font-sans text-[#38BDF8]">
            {documents.updatedAt}
          </p>
          <p className="text-base sm:text-[20px] text-[#D4D9E2]/80 leading-relaxed font-serif pt-2">
            {documents.intro}
          </p>
        </div>

        {/* Continuous Numbered Sections */}
        <div className="space-y-10">
          {documents.sections.map((sec, idx) => (
            <section key={idx} className="space-y-2.5">
              <h2 className="text-xl sm:text-[26px] font-semibold text-[#D5D9E2]">
                {sec.num}
              </h2>
              <p className="text-base sm:text-[19px] text-[#D4D9E2]/90 leading-[1.65] font-serif">
                {sec.text}
              </p>
            </section>
          ))}
        </div>

        {/* Article End Navigation */}
        <div className="pt-10 border-t border-white/[0.08] flex items-center justify-between text-xs font-sans text-[#D4D9E2]/60">
          <button
            onClick={() => onNavigate('/')}
            className="text-[#38BDF8] hover:underline"
          >
            ← Voltar à página inicial
          </button>
          <span>Cérebro Central · Documento Oficial</span>
        </div>
      </div>
    </article>
  );
};

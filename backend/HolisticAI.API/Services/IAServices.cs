using OpenAI.Chat;

namespace HolisticAI.API.Services;

public class IAService
{
    private readonly string _apiKey;

    public IAService(IConfiguration configuration)
    {
        _apiKey = configuration["OpenAI:ApiKey"]
            ?? throw new InvalidOperationException("OpenAI:ApiKey não configurada.");
    }

    public async Task<string> GerarProntuarioAsync(
        string nomePaciente,
        string terapia,
        int duracao,
        string relato,
        string estadoEnergetico)
    {
        var client = new ChatClient(model: "gpt-4o-mini", apiKey: _apiKey);

        var prompt = $@"
Você é um terapeuta holístico experiente e especialista em documentação clínica terapêutica.

Sua função é gerar um prontuário profissional, claro, objetivo e ético, baseado EXCLUSIVAMENTE nas informações fornecidas.

⚠️ REGRAS IMPORTANTES:
- NÃO invente informações
- NÃO extrapole além do que foi informado
- NÃO utilize linguagem mística exagerada
- Use linguagem profissional, clínica e humanizada
- Seja direto e organizado

DADOS DA SESSÃO:

Paciente: {nomePaciente}
Terapia aplicada: {terapia}
Duração: {duracao} minutos

Relato inicial do paciente:
{relato}

Percepção energética do terapeuta:
{estadoEnergetico}

---

Gere o prontuário no seguinte formato:

## 📝 Resumo da Sessão
Resumo objetivo do atendimento realizado, incluindo foco principal da sessão.

## ⚡ Análise Energética
Descreva de forma técnica a leitura energética do paciente, baseada no relato fornecido.

## 🛠️ Intervenções Realizadas
Liste claramente as técnicas utilizadas durante a sessão.

## 📌 Recomendações
Sugestões práticas para o paciente (ex: hábitos, frequência de sessões, cuidados).

## 📈 Evolução do Paciente
Avaliação da resposta ao atendimento e próximos passos terapêuticos.

---

Seja claro, profissional e objetivo.
";

        ChatMessage[] mensagens =
        [
            new SystemChatMessage("Você é um profissional experiente em documentação clínica terapêutica."),
            new UserChatMessage(prompt)
        ];

        var response = await client.CompleteChatAsync(mensagens);

        var completion = response.Value;

        if (completion is null || completion.Content is null || completion.Content.Count == 0)
            return "Não foi possível gerar o conteúdo do prontuário.";

        var texto = string.Join(
            "\n",
            completion.Content
                .Where(c => !string.IsNullOrWhiteSpace(c.Text))
                .Select(c => c.Text)
        );

        return string.IsNullOrWhiteSpace(texto)
            ? "Não foi possível gerar o conteúdo do prontuário."
            : texto.Trim();
    }
}
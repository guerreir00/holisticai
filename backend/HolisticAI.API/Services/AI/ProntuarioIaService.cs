
using System.Text;

namespace HolisticAI.API.Services.AI;

public class ProntuarioIaService : IProntuarioIaService
{
    public Task<ProntuarioIaResult> GerarAsync(ProntuarioIaInput input)
    {
        var sb = new StringBuilder();

        sb.AppendLine("Resumo da Sessão:");
        sb.AppendLine(
            $"Paciente {input.PacienteNome} participou de atendimento" +
            $"{(string.IsNullOrWhiteSpace(input.TerapiaAplicada) ? "" : $" com foco em {input.TerapiaAplicada}")}" +
            $"{(input.DuracaoMinutos.HasValue ? $" com duração aproximada de {input.DuracaoMinutos.Value} minutos" : "")}."
        );
        sb.AppendLine();

        if (!string.IsNullOrWhiteSpace(input.RelatoInicial))
        {
            sb.AppendLine("Relato Inicial:");
            sb.AppendLine(input.RelatoInicial.Trim());
            sb.AppendLine();
        }

        if (!string.IsNullOrWhiteSpace(input.SituacaoEnergetica))
        {
            sb.AppendLine("Situação Energética Observada:");
            sb.AppendLine(input.SituacaoEnergetica.Trim());
            sb.AppendLine();
        }

        var chakras = new List<string>();

        AddChakra(chakras, "Base", input.ChakraBase);
        AddChakra(chakras, "Sacral", input.ChakraSacral);
        AddChakra(chakras, "Plexo Solar", input.ChakraPlexo);
        AddChakra(chakras, "Cardíaco", input.ChakraCardiaco);
        AddChakra(chakras, "Laríngeo", input.ChakraLaringeo);
        AddChakra(chakras, "Frontal", input.ChakraFrontal);
        AddChakra(chakras, "Coronário", input.ChakraCoronario);

        if (chakras.Count > 0)
        {
            sb.AppendLine("Leitura Energética:");
            sb.AppendLine("Foram observados os seguintes centros com maior relevância durante a sessão:");
            foreach (var chakra in chakras)
                sb.AppendLine($"- {chakra}");
            sb.AppendLine();
        }

        AppendArea(sb, "Trabalho", input.Trabalho);
        AppendArea(sb, "Família", input.Familia);
        AppendArea(sb, "Prosperidade", input.Prosperidade);
        AppendArea(sb, "Espiritualidade", input.Espiritualidade);
        AppendArea(sb, "Relações Afetivas", input.RelacoesAfetivas);

        if (!string.IsNullOrWhiteSpace(input.TratamentoExecutado))
        {
            sb.AppendLine("Tratamento Executado:");
            sb.AppendLine(input.TratamentoExecutado.Trim());
            sb.AppendLine();
        }

        if (!string.IsNullOrWhiteSpace(input.OrientacaoParaCasa))
        {
            sb.AppendLine("Orientações para Casa:");
            sb.AppendLine(input.OrientacaoParaCasa.Trim());
            sb.AppendLine();
        }

        if (!string.IsNullOrWhiteSpace(input.ObservacoesSessao))
        {
            sb.AppendLine("Observações Complementares:");
            sb.AppendLine(input.ObservacoesSessao.Trim());
            sb.AppendLine();
        }

        sb.AppendLine("Próximos Focos Terapêuticos:");
        sb.AppendLine("Sugere-se acompanhar a evolução emocional, energética e comportamental nas próximas sessões, com atenção aos temas predominantes relatados no atendimento.");

        var result = new ProntuarioIaResult
        {
            TituloSugerido = $"Prontuário - {input.DataSessao:dd/MM/yyyy}",
            ConteudoGerado = sb.ToString().Trim(),
            Modelo = "mock-local-v1"
        };

        return Task.FromResult(result);
    }

    private static void AppendArea(StringBuilder sb, string titulo, string? valor)
    {
        if (string.IsNullOrWhiteSpace(valor))
            return;

        sb.AppendLine($"{titulo}:");
        sb.AppendLine(valor.Trim());
        sb.AppendLine();
    }

    private static void AddChakra(List<string> chakras, string nome, int? valor)
    {
        if (!valor.HasValue)
            return;

        chakras.Add($"{nome}: {valor.Value}%");
    }
}
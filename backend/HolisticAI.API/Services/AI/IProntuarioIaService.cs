namespace HolisticAI.API.Services.AI;

public interface IProntuarioIaService
{
    Task<ProntuarioIaResult> GerarAsync(ProntuarioIaInput input);
}

public class ProntuarioIaInput
{
    public string PacienteNome { get; set; } = string.Empty;
    public string? TerapiaAplicada { get; set; }
    public DateTime DataSessao { get; set; }
    public int? DuracaoMinutos { get; set; }
    public string? RelatoInicial { get; set; }
    public string? SituacaoEnergetica { get; set; }

    public int? ChakraBase { get; set; }
    public int? ChakraSacral { get; set; }
    public int? ChakraPlexo { get; set; }
    public int? ChakraCardiaco { get; set; }
    public int? ChakraLaringeo { get; set; }
    public int? ChakraFrontal { get; set; }
    public int? ChakraCoronario { get; set; }

    public string? Trabalho { get; set; }
    public string? Familia { get; set; }
    public string? Prosperidade { get; set; }
    public string? Espiritualidade { get; set; }
    public string? RelacoesAfetivas { get; set; }

    public string? TratamentoExecutado { get; set; }
    public string? OrientacaoParaCasa { get; set; }
    public string? ObservacoesSessao { get; set; }
}

public class ProntuarioIaResult
{
    public string TituloSugerido { get; set; } = "Prontuário da Sessão";
    public string ConteudoGerado { get; set; } = string.Empty;
    public string Modelo { get; set; } = "mock-local";
}
using UnityEngine;

/// <summary>
/// Gerencia o progresso do jogador e persistência dos níveis usando PlayerPrefs.
/// </summary>
public class LevelSystem : MonoBehaviour
{
    public const int MaxLevels = 120;
    private const string LevelKey = "LevelUnlocked_";

    void Awake()
    {
        // Garante que o primeiro nível está sempre desbloqueado
        if (!PlayerPrefs.HasKey(LevelKey + "0"))
            PlayerPrefs.SetInt(LevelKey + "0", 1);
    }

    /// <summary>
    /// Marca o nível como completo e desbloqueia o próximo.
    /// </summary>
    /// <param name="levelIndex">Índice do nível completado</param>
    public void CompleteLevel(int levelIndex)
    {
        if (levelIndex < MaxLevels - 1)
        {
            PlayerPrefs.SetInt(LevelKey + (levelIndex + 1), 1);
        }
        PlayerPrefs.Save();
    }

    /// <summary>
    /// Verifica se o nível está desbloqueado.
    /// </summary>
    public bool IsLevelUnlocked(int levelIndex)
    {
        return PlayerPrefs.GetInt(LevelKey + levelIndex, 0) == 1;
    }

    /// <summary>
    /// Reseta todo o progresso (opcional, para debug).
    /// </summary>
    public void ResetProgress()
    {
        for (int i = 0; i < MaxLevels; i++)
            PlayerPrefs.DeleteKey(LevelKey + i);
        PlayerPrefs.SetInt(LevelKey + "0", 1);
        PlayerPrefs.Save();
    }
}

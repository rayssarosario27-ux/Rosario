using UnityEngine;
using UnityEngine.SceneManagement;

/// <summary>
/// Gerencia o fluxo de cenas do jogo.
/// </summary>
public class SceneController : MonoBehaviour
{
    /// <summary>
    /// Carrega a cena do menu inicial.
    /// </summary>
    public void LoadMainMenu()
    {
        SceneManager.LoadScene("MainMenu");
    }

    /// <summary>
    /// Carrega a cena do mapa de fases.
    /// </summary>
    public void LoadLevelMap()
    {
        SceneManager.LoadScene("LevelMap");
    }

    /// <summary>
    /// Carrega a cena de seleção de personagem.
    /// </summary>
    public void LoadCharacterSelect()
    {
        SceneManager.LoadScene("CharacterSelect");
    }

    /// <summary>
    /// Carrega a cena de gameplay.
    /// </summary>
    public void LoadGameplay()
    {
        SceneManager.LoadScene("Gameplay");
    }

    /// <summary>
    /// Sai do jogo (não funciona no WebGL, mas útil para mobile/desktop).
    /// </summary>
    public void QuitGame()
    {
        Application.Quit();
    }
}

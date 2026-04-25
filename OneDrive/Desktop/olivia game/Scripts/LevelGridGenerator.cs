using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// Gera dinamicamente os botões de seleção de fase em um GridLayoutGroup.
/// </summary>
public class LevelGridGenerator : MonoBehaviour
{
    public GameObject levelButtonPrefab; // Prefab do botão de fase
    public Transform gridParent; // Objeto com GridLayoutGroup
    private LevelSystem levelSystem;
    public int totalLevels = 120;

    void Awake()
    {
        levelSystem = FindObjectOfType<LevelSystem>();
        GenerateLevelButtons();
    }

    /// <summary>
    /// Gera os botões de fase dinamicamente.
    /// </summary>
    public void GenerateLevelButtons()
    {
        for (int i = 0; i < totalLevels; i++)
        {
            GameObject btnObj = Instantiate(levelButtonPrefab, gridParent);
            Button btn = btnObj.GetComponent<Button>();
            Text txt = btnObj.GetComponentInChildren<Text>();
            txt.text = (i + 1).ToString();
            bool unlocked = levelSystem.IsLevelUnlocked(i);
            btn.interactable = unlocked;
            int levelIndex = i; // Necessário para delegate
            btn.onClick.AddListener(() => OnLevelButtonClicked(levelIndex));
        }
    }

    /// <summary>
    /// Método público para ser chamado ao clicar no botão de fase.
    /// </summary>
    public void OnLevelButtonClicked(int levelIndex)
    {
        // Salva o nível selecionado e troca de cena
        PlayerPrefs.SetInt("SelectedLevel", levelIndex);
        PlayerPrefs.Save();
        // Troca de cena deve ser feita pelo SceneController
    }
}

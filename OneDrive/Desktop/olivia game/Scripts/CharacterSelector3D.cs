using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// Carrossel 3D para seleção de personagens com rotação suave e destaque no card central.
/// </summary>
public class CharacterSelector3D : MonoBehaviour
{
    public Transform[] characterCards; // Arraste os 4 cards no Inspector
    public float radius = 3f;
    public float lerpSpeed = 5f;
    public Vector3 center = Vector3.zero;
    public float scaleCentral = 1.2f;
    public float scaleSide = 0.8f;

    private int selectedIndex = 0;
    private int totalCharacters;
    private float targetAngle = 0f;

    void Start()
    {
        totalCharacters = characterCards.Length;
        selectedIndex = PlayerPrefs.GetInt("SelectedCharacter", 0);
        UpdateCarousel(true);
    }

    void Update()
    {
        // Input de teclado (ou pode ser chamado por botões UI)
        if (Input.GetKeyDown(KeyCode.RightArrow))
            SelectNext();
        else if (Input.GetKeyDown(KeyCode.LeftArrow))
            SelectPrevious();
        // Rotação suave
        UpdateCarousel(false);
    }

    /// <summary>
    /// Seleciona o próximo personagem.
    /// </summary>
    public void SelectNext()
    {
        selectedIndex = (selectedIndex + 1) % totalCharacters;
        PlayerPrefs.SetInt("SelectedCharacter", selectedIndex);
        PlayerPrefs.Save();
        targetAngle -= 180f / (totalCharacters - 1);
    }

    /// <summary>
    /// Seleciona o personagem anterior.
    /// </summary>
    public void SelectPrevious()
    {
        selectedIndex = (selectedIndex - 1 + totalCharacters) % totalCharacters;
        PlayerPrefs.SetInt("SelectedCharacter", selectedIndex);
        PlayerPrefs.Save();
        targetAngle += 180f / (totalCharacters - 1);
    }

    /// <summary>
    /// Atualiza a posição e escala dos cards no carrossel.
    /// </summary>
    private void UpdateCarousel(bool instant)
    {
        for (int i = 0; i < totalCharacters; i++)
        {
            float angle = (i - selectedIndex) * (180f / (totalCharacters - 1)) + targetAngle;
            float rad = angle * Mathf.Deg2Rad;
            Vector3 targetPos = center + new Vector3(Mathf.Sin(rad) * radius, 0, Mathf.Cos(rad) * radius);
            characterCards[i].localPosition = instant ? targetPos : Vector3.Lerp(characterCards[i].localPosition, targetPos, Time.deltaTime * lerpSpeed);
            float scale = (i == selectedIndex) ? scaleCentral : scaleSide;
            characterCards[i].localScale = instant ? Vector3.one * scale : Vector3.Lerp(characterCards[i].localScale, Vector3.one * scale, Time.deltaTime * lerpSpeed);
        }
    }
}

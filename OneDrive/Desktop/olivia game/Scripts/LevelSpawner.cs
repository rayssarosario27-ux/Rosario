using UnityEngine;

/// <summary>
/// Instancia o prefab da fase correta na cena de gameplay.
/// </summary>
public class LevelSpawner : MonoBehaviour
{
    public GameObject[] prefabsDeFase; // Arraste os 120 prefabs de fase no Inspector
    public Transform parentFase; // Onde o prefab será instanciado

    void Start()
    {
        int nivel = PlayerPrefs.GetInt("SelectedLevel", 0);
        if (nivel >= 0 && nivel < prefabsDeFase.Length)
        {
            Instantiate(prefabsDeFase[nivel], parentFase);
        }
        else
        {
            Debug.LogError("Prefab de fase não encontrado para o nível " + nivel);
        }
    }
}

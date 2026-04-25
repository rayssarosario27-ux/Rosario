using UnityEngine;

/// <summary>
/// Controlador do jogador com física 2D, pulo, velocidade e troca de skin.
/// </summary>
[RequireComponent(typeof(Rigidbody2D))]
public class PlayerController : MonoBehaviour
{
    [Header("Movimentação")]
    public float velocidade = 5f;
    public float forcaPulo = 10f;
    public LayerMask layerChao;
    public Transform checagemChao;
    public float raioChao = 0.2f;

    [Header("Skins")]
    public Sprite[] spritesPersonagens; // Arraste os sprites dos campeões
    private SpriteRenderer spriteRenderer;

    private Rigidbody2D rb;
    private bool estaNoChao;
    private float inputHorizontal;

    void Start()
    {
        rb = GetComponent<Rigidbody2D>();
        spriteRenderer = GetComponent<SpriteRenderer>();
        // Troca a skin do personagem
        int index = PlayerPrefs.GetInt("SelectedCharacter", 0);
        if (spritesPersonagens != null && index < spritesPersonagens.Length)
            spriteRenderer.sprite = spritesPersonagens[index];
    }

    void Update()
    {
        inputHorizontal = Input.GetAxisRaw("Horizontal");
        // Pulo
        if (Input.GetButtonDown("Jump") && estaNoChao)
            rb.velocity = new Vector2(rb.velocity.x, forcaPulo);
    }

    void FixedUpdate()
    {
        // Movimentação
        rb.velocity = new Vector2(inputHorizontal * velocidade, rb.velocity.y);
        // Checagem de chão
        estaNoChao = Physics2D.OverlapCircle(checagemChao.position, raioChao, layerChao);
    }
}

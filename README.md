# MCP JSON Builder

**MCP JSON Builder** é uma ferramenta visual para criar, editar e exportar estruturas JSON complexas para modelagem de aplicações modulares. Ideal para documentação técnica, design de software orientado a módulos ou como base de comunicação entre times de desenvolvimento e produto.

## ✨ Funcionalidades

-   ✅ Interface gráfica para construção de JSONs hierárquicos.
-   🧩 Suporte a múltiplos módulos com descrições e listas de funcionalidades.
-   🔄 Visualização em tempo real do JSON estruturado.
-   💾 Botões integrados para salvar, exportar, importar e reverter mudanças (histórico).
-   🤖 Geração automática de JSON com inteligência artificial.
-   🌙 Suporte a modo escuro e claro.

---

## 📦 Estrutura do JSON

O JSON gerado segue um modelo modular como o exemplo abaixo:

```json
{
    "MCP": {
        "ApplicationName": "ItemSalesPlatform",
        "Purpose": "To facilitate the selling of items to clients online, including user registration and payment processing.",
        "Modules": [
            {
                "ModuleName": "UserRegistration",
                "Description": "Handles user sign-up, login, and profile management.",
                "Features": [
                    "User Sign-Up",
                    "User Login",
                    "Profile Management",
                    "Password Recovery"
                ]
            },
            {
                "ModuleName": "ItemManagement",
                "Description": "Allows for the addition, modification, and deletion of items for sale.",
                "Features": [
                    "Add New Items",
                    "Edit Existing Items",
                    "Delete Items",
                    "Item Categories"
                ]
            }
        ]
    }
}
```

---

## 🚀 Como Usar

1. Clone o repositório ou abra o MCP JSON Builder em seu navegador.
2. Use o painel lateral para adicionar campos, módulos e funcionalidades.
3. Visualize o JSON em tempo real no painel de visualização.
4. Use os botões:
    - **Add Field**: Adiciona novos campos ou estruturas.
    - **Save**: Salva seu progresso.
    - **Export**: Exporta o JSON final.
    - **Import**: Recarrega um JSON previamente salvo.
    - **Generate JSON (AI)**: Cria sugestões de JSON automaticamente.
5. Copie ou baixe o JSON final para uso em suas aplicações.

---

## 🧑‍💻 Tecnologias Utilizadas

-   HTML/CSS/JavaScript
-   JSON Viewer e Builder
-   Integração com IA (para geração de estrutura)

---

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

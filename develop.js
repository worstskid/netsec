require.config({
    paths: {
        vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs"
    }
})

require(["vs/editor/editor.main"], () => {
    monaco.editor.defineTheme("netware", {
        base: "vs-dark",
        inherit: true,
        rules: [
            {
                token: "comment",
                foreground: "6f737b"
            },
            {
                token: "string",
                foreground: "b8d68a"
            },
            {
                token: "keyword",
                foreground: "d69ac7"
            },
            {
                token: "number",
                foreground: "9fc7e8"
            },
            {
                token: "type",
                foreground: "7dc8e8"
            },
            {
                token: "identifier",
                foreground: "e1e3e6"
            }
        ],
        colors: {
            "editor.background": "#1e1f22",
            "editor.foreground": "#d7d9dd",
            "editorLineNumber.foreground": "#55585e",
            "editorLineNumber.activeForeground": "#aeb0b4",
            "editorCursor.foreground": "#ffffff",
            "editor.selectionBackground": "#3b4048",
            "editor.lineHighlightBackground": "#25272b",
            "editorIndentGuide.background": "#303238",
            "editorIndentGuide.activeBackground": "#45484f"
        }
    })

    monaco.editor.create(
        document.getElementById("editor"),
        {
            value: "-- NetWare Skidding Area\n\nprint(\"Hacking FBI. . .\")\n",
            language: "lua",
            theme: "netware",
            automaticLayout: true,
            minimap: {
                enabled: false
            },
            fontSize: 13,
            lineHeight: 21,
            padding: {
                top: 14,
                bottom: 14
            },
            scrollBeyondLastLine: false,
            roundedSelection: true,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            renderWhitespace: "selection"
        }
    )
})

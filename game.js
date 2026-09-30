const workerurl =
    "https://ancient-tooth-4fdb.cometv2.workers.dev"

const params =
    new URLSearchParams(window.location.search)

const gameid =
    params.get("id")

const gameimage =
    document.getElementById("gameimage")

const gametitle =
    document.getElementById("gametitle")

const creator =
    document.getElementById("creator")

const playbutton =
    document.getElementById("playbutton")

const gamecode =
    document.getElementById("gamecode")

const copybutton =
    document.getElementById("copybutton")

const players =
    document.getElementById("players")

const visits =
    document.getElementById("visits")

const upvotes =
    document.getElementById("upvotes")

const downvotes =
    document.getElementById("downvotes")

const statlikes =
    document.getElementById("statlikes")

const statdislikes =
    document.getElementById("statdislikes")

const likebar =
    document.getElementById("likebar")

let rawscript = ""

function formatnumber(number) {
    return Number(number || 0).toLocaleString()
}

function savevisitedgame(gameid) {
    try {
        let visited =
            JSON.parse(
                localStorage.getItem(
                    "netware-visited-games"
                )
            )

        if (!Array.isArray(visited)) {
            visited = []
        }

        visited =
            visited.filter(
                id => id !== gameid
            )

        visited.unshift(gameid)

        localStorage.setItem(
            "netware-visited-games",
            JSON.stringify(visited)
        )
    } catch (error) {
        console.error(
            "could not save visited game",
            error
        )
    }
}

function escapehtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
}

function span(type, value) {
    return `<span class="lua-${type}">${escapehtml(value)}</span>`
}

function highlightlua(code) {
    const keywords = new Set([
        "and",
        "break",
        "do",
        "else",
        "elseif",
        "end",
        "false",
        "for",
        "function",
        "goto",
        "if",
        "in",
        "local",
        "nil",
        "not",
        "or",
        "repeat",
        "return",
        "then",
        "true",
        "until",
        "while"
    ])

    const builtins = new Set([
        "assert",
        "collectgarbage",
        "dofile",
        "error",
        "getmetatable",
        "ipairs",
        "load",
        "loadfile",
        "next",
        "pairs",
        "pcall",
        "print",
        "rawequal",
        "rawget",
        "rawlen",
        "rawset",
        "require",
        "select",
        "setmetatable",
        "tonumber",
        "tostring",
        "type",
        "unpack",
        "xpcall",
        "warn",
        "wait",
        "spawn",
        "delay",
        "tick",
        "time",
        "typeof",
        "loadstring",
        "getgenv",
        "getfenv",
        "setfenv",
        "hookfunction",
        "hookmetamethod",
        "newcclosure",
        "checkcaller",
        "getgc",
        "getconnections",
        "getupvalues",
        "setupvalue",
        "getrawmetatable",
        "setreadonly",
        "isreadonly"
    ])

    let output = ""
    let i = 0

    while (i < code.length) {
        if (code.startsWith("--[[", i)) {
            const end =
                code.indexOf(
                    "]]",
                    i + 4
                )

            if (end === -1) {
                output += span(
                    "comment",
                    code.slice(i)
                )
                break
            }

            output += span(
                "comment",
                code.slice(
                    i,
                    end + 2
                )
            )

            i = end + 2
            continue
        }

        if (code.startsWith("--", i)) {
            const end =
                code.indexOf(
                    "\n",
                    i
                )

            if (end === -1) {
                output += span(
                    "comment",
                    code.slice(i)
                )
                break
            }

            output += span(
                "comment",
                code.slice(
                    i,
                    end
                )
            )

            i = end
            continue
        }

        if (code.startsWith("[[", i)) {
            const end =
                code.indexOf(
                    "]]",
                    i + 2
                )

            if (end === -1) {
                output += span(
                    "string",
                    code.slice(i)
                )
                break
            }

            output += span(
                "string",
                code.slice(
                    i,
                    end + 2
                )
            )

            i = end + 2
            continue
        }

        if (
            code[i] === '"' ||
            code[i] === "'"
        ) {
            const quote = code[i]
            let end = i + 1

            while (end < code.length) {
                if (code[end] === "\\") {
                    end += 2
                    continue
                }

                if (code[end] === quote) {
                    end++
                    break
                }

                end++
            }

            output += span(
                "string",
                code.slice(
                    i,
                    end
                )
            )

            i = end
            continue
        }

        if (/[0-9]/.test(code[i])) {
            let end = i + 1

            while (
                end < code.length &&
                /[0-9a-fA-FxX.]/.test(
                    code[end]
                )
            ) {
                end++
            }

            output += span(
                "number",
                code.slice(
                    i,
                    end
                )
            )

            i = end
            continue
        }

        if (/[a-zA-Z_]/.test(code[i])) {
            let end = i + 1

            while (
                end < code.length &&
                /[a-zA-Z0-9_]/.test(
                    code[end]
                )
            ) {
                end++
            }

            const word =
                code.slice(
                    i,
                    end
                )

            let next = end

            while (
                next < code.length &&
                /\s/.test(code[next])
            ) {
                next++
            }

            if (keywords.has(word)) {
                output += span(
                    "keyword",
                    word
                )
            } else if (
                builtins.has(word)
            ) {
                output += span(
                    "builtin",
                    word
                )
            } else if (
                code[next] === "("
            ) {
                output += span(
                    "function",
                    word
                )
            } else if (
                code[i - 1] === "."
            ) {
                output += span(
                    "property",
                    word
                )
            } else {
                output += span(
                    "variable",
                    word
                )
            }

            i = end
            continue
        }

        if (code.startsWith("...", i)) {
            output += span(
                "operator",
                "..."
            )

            i += 3
            continue
        }

        if (
            code.startsWith("==", i) ||
            code.startsWith("~=", i) ||
            code.startsWith("<=", i) ||
            code.startsWith(">=", i) ||
            code.startsWith("..", i)
        ) {
            output += span(
                "operator",
                code.slice(
                    i,
                    i + 2
                )
            )

            i += 2
            continue
        }

        if ("+-*/%^#=<>".includes(code[i])) {
            output += span(
                "operator",
                code[i]
            )

            i++
            continue
        }

        if ("(){}[];,:.".includes(code[i])) {
            output += span(
                "punctuation",
                code[i]
            )

            i++
            continue
        }

        output += escapehtml(code[i])
        i++
    }

    return output
}

function applystats(data) {
    players.textContent =
        formatnumber(data.players)

    visits.textContent =
        formatnumber(data.visits)

    upvotes.textContent =
        formatnumber(data.upvotes)

    downvotes.textContent =
        formatnumber(data.downvotes)

    statlikes.textContent =
        formatnumber(data.upvotes)

    statdislikes.textContent =
        formatnumber(data.downvotes)

    const total =
        Number(data.upvotes || 0) +
        Number(data.downvotes || 0)

    const percentage =
        total > 0
            ? (
                Number(data.upvotes || 0) /
                total
            ) * 100
            : 0

    likebar.style.width =
        `${percentage}%`

    creator.textContent =
        data.creator || "Unknown"
}

async function loadstats() {
    const cachekey =
        `netware-game-${gameid}`

    try {
        const response =
            await fetch(
                `${workerurl}/game/${gameid}`,
                {
                    cache: "no-store"
                }
            )

        if (!response.ok) {
            throw new Error(
                `http ${response.status}`
            )
        }

        const data =
            await response.json()

        localStorage.setItem(
            cachekey,
            JSON.stringify(data)
        )

        applystats(data)
    } catch (error) {
        console.error(
            "could not load stats",
            error
        )

        try {
            const cached =
                localStorage.getItem(
                    cachekey
                )

            if (cached) {
                const data =
                    JSON.parse(cached)

                applystats(data)
                return
            }
        } catch (cacheerror) {
            console.error(
                "could not load cached stats",
                cacheerror
            )
        }

        players.textContent = "—"
        visits.textContent = "—"
        upvotes.textContent = "—"
        downvotes.textContent = "—"
        statlikes.textContent = "—"
        statdislikes.textContent = "—"
        creator.textContent = "Unknown"
    }
}

async function loadgame() {
    try {
        const response =
            await fetch(
                "/Games/games.json"
            )

        if (!response.ok) {
            throw new Error(
                `games.json http ${response.status}`
            )
        }

        const games =
            await response.json()

        const game =
            games.find(item => {
                const match =
                    item.link.match(
                        /games\/(\d+)/
                    )

                return (
                    match &&
                    match[1] === gameid
                )
            })

        if (!game) {
            gametitle.textContent =
                "Game Not Found"

            return
        }

        savevisitedgame(gameid)

        gametitle.textContent =
            game.title

        gameimage.src =
            `/Games/Thumbnails/${game.thumbnail}`

        gameimage.alt =
            game.title

        playbutton.href =
            game.link

        const scriptresponse =
            await fetch(
                `/Games/Scripts/${game.script}`
            )

        if (scriptresponse.ok) {
            rawscript =
                await scriptresponse.text()

            gamecode.innerHTML =
                highlightlua(rawscript)
        } else {
            rawscript = ""

            gamecode.textContent =
                "script not found"
        }

        await loadstats()
    } catch (error) {
        console.error(
            "could not load game",
            error
        )

        gametitle.textContent =
            "Could not load game"
    }
}

async function copyscript() {
    if (!rawscript) {
        return false
    }

    if (
        navigator.clipboard &&
        typeof navigator.clipboard.writeText ===
            "function"
    ) {
        try {
            await navigator.clipboard.writeText(
                rawscript
            )

            return true
        } catch (error) {
            console.error(
                "clipboard api failed",
                error
            )
        }
    }

    try {
        const textarea =
            document.createElement(
                "textarea"
            )

        textarea.value =
            rawscript

        textarea.style.position =
            "fixed"

        textarea.style.left =
            "-9999px"

        textarea.style.top =
            "0"

        document.body.appendChild(
            textarea
        )

        textarea.focus()
        textarea.select()

        textarea.setSelectionRange(
            0,
            textarea.value.length
        )

        const copied =
            document.execCommand(
                "copy"
            )

        document.body.removeChild(
            textarea
        )

        return copied
    } catch (error) {
        console.error(
            "fallback copy failed",
            error
        )

        return false
    }
}

if (copybutton) {
    copybutton.addEventListener(
        "click",
        async () => {
            const copied =
                await copyscript()

            if (!copied) {
                return
            }

            copybutton.classList.add(
                "copied"
            )

            setTimeout(() => {
                copybutton.classList.remove(
                    "copied"
                )
            }, 1000)
        }
    )
}

if (gameid) {
    loadgame()
}
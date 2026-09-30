const discordbutton = document.getElementById("discordbutton")
const searchform = document.getElementById("searchform")
const searchinput = document.getElementById("searchinput")
const searchresults = document.getElementById("searchresults")

let allgames = []

function formatnumber(number) {
    return Number(number || 0).toLocaleString()
}

function getgameid(link) {
    const match = link.match(/games\/(\d+)/)
    return match ? match[1] : null
}

function getvisitedgames() {
    try {
        const visited = JSON.parse(
            localStorage.getItem("netware-visited-games")
        )

        return Array.isArray(visited)
            ? visited
            : []
    } catch (error) {
        return []
    }
}

function savevisitedgame(gameid) {
    try {
        let visited = getvisitedgames()

        visited = visited.filter(id => id !== gameid)
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

function creategamecard(game) {
    const gameid = getgameid(game.link)

    if (!gameid) {
        return null
    }

    const element = document.createElement("a")

    element.className = "game"
    element.href =
        `/game.html?id=${encodeURIComponent(gameid)}`

    element.style.textDecoration = "none"

    const thumb = document.createElement("div")
    thumb.className = "thumb"

    const image = document.createElement("img")

    image.src =
        `/Games/Thumbnails/${game.thumbnail}`

    image.alt = game.title
    image.loading = "lazy"

    thumb.appendChild(image)

    const title = document.createElement("div")

    title.className = "title"
    title.textContent = game.title

    const players = document.createElement("div")

    players.className = "players"
    players.textContent = "Loading players..."

    const likes = document.createElement("div")

    likes.className = "likes"

    likes.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 10v10H4V10h3zm2 10h7.5c.8 0 1.5-.5 1.8-1.2l2-6c.4-1.2-.5-2.5-1.8-2.5H14l.8-4.2c.1-.6-.1-1.2-.6-1.6L13 4l-4 6v10z"></path>
        </svg>
        <span>—</span>
    `

    element.appendChild(thumb)
    element.appendChild(title)
    element.appendChild(players)
    element.appendChild(likes)

    loadcardstats(
        gameid,
        players,
        likes.querySelector("span")
    )

    return element
}

async function loadcardstats(
    gameid,
    playersElement,
    likesElement
) {
    const cachekey =
        `netware-game-${gameid}`

    try {
        const cached =
            localStorage.getItem(cachekey)

        if (!cached) {
            playersElement.textContent =
                "— players"

            return
        }

        const data =
            JSON.parse(cached)

        playersElement.textContent =
            `${formatnumber(data.players)} players`

        likesElement.textContent =
            formatnumber(data.upvotes)
    } catch (error) {
        console.error(
            "could not load cached card stats",
            error
        )
    }
}

function rendercontinue(games) {
    const section =
        document.getElementById("continueSection")

    const container =
        document.getElementById("continuegames")

    if (!section || !container) {
        return []
    }

    const visited =
        getvisitedgames()

    const continued = []

    visited.forEach(gameid => {
        const game =
            games.find(item =>
                getgameid(item.link) === gameid
            )

        if (game) {
            continued.push(game)
        }
    })

    container.innerHTML = ""

    continued.slice(0, 5).forEach(game => {
        const card =
            creategamecard(game)

        if (card) {
            container.appendChild(card)
        }
    })

    if (continued.length > 0) {
        section.classList.remove("hidden")
    } else {
        section.classList.add("hidden")
    }

    return continued
}

function renderrecommended(games, continued) {
    const containers =
        document.querySelectorAll("#games")

    const continuedids =
        new Set(
            continued.map(game =>
                getgameid(game.link)
            )
        )

    const recommended =
        games.filter(game => {
            const gameid =
                getgameid(game.link)

            return (
                gameid &&
                !continuedids.has(gameid)
            )
        })

    containers.forEach(container => {
        container.innerHTML = ""

        recommended.forEach(game => {
            const card =
                creategamecard(game)

            if (card) {
                container.appendChild(card)
            }
        })
    })
}

function searchgames(query) {
    const normalized =
        query.trim().toLowerCase()

    if (!normalized) {
        searchresults.classList.remove("visible")
        searchresults.innerHTML = ""
        return
    }

    const matches =
        allgames.filter(game =>
            game.title
                .toLowerCase()
                .includes(normalized)
        )

    searchresults.innerHTML = ""

    if (matches.length === 0) {
        const empty =
            document.createElement("div")

        empty.className = "searchempty"
        empty.textContent = "No games found"

        searchresults.appendChild(empty)
        searchresults.classList.add("visible")

        return
    }

    matches.slice(0, 6).forEach(game => {
        const gameid =
            getgameid(game.link)

        if (!gameid) {
            return
        }

        const item =
            document.createElement("a")

        item.className = "searchitem"
        item.href =
            `/game.html?id=${encodeURIComponent(gameid)}`

        const image =
            document.createElement("img")

        image.src =
            `/Games/Thumbnails/${game.thumbnail}`

        image.alt = game.title

        const details =
            document.createElement("div")

        details.className = "searchdetails"

        const title =
            document.createElement("div")

        title.className = "searchtitle"
        title.textContent = game.title

        const playertext =
            document.createElement("div")

        playertext.className = "searchplayers"
        playertext.textContent = "Game"

        details.appendChild(title)
        details.appendChild(playertext)

        item.appendChild(image)
        item.appendChild(details)

        searchresults.appendChild(item)
    })

    searchresults.classList.add("visible")
}

async function loadgames() {
    try {
        const response =
            await fetch("/Games/games.json")

        if (!response.ok) {
            throw new Error(
                `games.json http ${response.status}`
            )
        }

        allgames =
            await response.json()

        const continued =
            rendercontinue(allgames)

        renderrecommended(
            allgames,
            continued
        )
    } catch (error) {
        console.error(
            "could not load games",
            error
        )
    }
}

if (discordbutton) {
    discordbutton.addEventListener(
        "click",
        () => {
            window.open(
                "https://discord.gg/svgmV95Apm",
                "_blank",
                "noopener"
            )
        }
    )
}

if (searchinput) {
    searchinput.addEventListener(
        "input",
        () => {
            searchgames(searchinput.value)
        }
    )

    searchinput.addEventListener(
        "focus",
        () => {
            if (searchinput.value.trim()) {
                searchgames(searchinput.value)
            }
        }
    )
}

if (searchform) {
    searchform.addEventListener(
        "submit",
        event => {
            event.preventDefault()
        }
    )
}

document.addEventListener(
    "click",
    event => {
        if (
            searchform &&
            !searchform.contains(event.target)
        ) {
            searchresults.classList.remove(
                "visible"
            )
        }
    }
)

loadgames()
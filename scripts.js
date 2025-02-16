const ui = {
  txtImdbId: document.querySelector("#txtImdbId"),
  iframe: document.querySelector("iframe"),
  imdbSource: document.querySelector("#source"),
  lblImdbId: document.querySelector("#lblImdbId"),
  chckMovie: document.querySelector("#chckMovie"),
  chckSeries: document.querySelector("#chckSeries"),
  divHistoryContainer: document.querySelector("div.history_container"),
  btnToggleHistory: document.querySelector("button.history_toggler"),
}

/**
 * @typedef {Object} HistoryItem
 * @property {string} type
 * @property {string} src
 * @property {string} note
 */

/** @type {HistoryItem[]} */
let listHistory = []

/**
 * @param {string} type
 * @param {string} src
 */
function saveToHistory(type, src) {
  if (!src.startsWith("tt") || src.length !== 9) {
    return
  }

  const item = listHistory.find((h) => h.src === src)
  if (item) {
    item.type = type
  } else {
    listHistory.unshift({ type, src, note: "" })
  }

  localStorage.setItem("history", JSON.stringify(listHistory))
  updateHistoryView()
}

/**
 * @param {string} src
 */
function onEditNote(src) {
  const item = listHistory.find((h) => h.src === src)
  if (!item) {
    return
  }

  const note = prompt("Enter new note", item.note)
  if (note === null) {
    return
  }

  item.note = note
  localStorage.setItem("history", JSON.stringify(listHistory))
  updateHistoryView()
}

/**
 * @param {string} src
 */
function onRemoveHistory(src) {
  listHistory = listHistory.filter((h) => h.src !== src)
  localStorage.setItem("history", JSON.stringify(listHistory))
  updateHistoryView()
}

function updateHistoryView() {
  let html = ""
  listHistory.forEach((h) => {
    html += `
     <div>
        <button onclick="onSetSrc('${h.type}', '${h.src}', '${h.note}')">
          ${h.type} - ${h.note || h.src}
        </button>
        <button onClick="onEditNote('${h.src}')">e</button>
        <button onClick="onRemoveHistory('${h.src}')">x</button>
      </div>
  `
  })

  if (html === "") {
    html = "<p>No history</p>"
  }
  ui.divHistoryContainer.innerHTML = html
}

/**
 * @param {string} movie_type
 * @param {string} imdb_id
 */
function onSetSrc(movie_type = "", imdb_id = "") {
  if (movie_type === "series") {
    ui.chckSeries.checked = true
  }

  if (movie_type === "movie") {
    ui.chckMovie.checked = true
  }

  if (imdb_id) {
    ui.txtImdbId.value = imdb_id
  }

  const type = ui.chckSeries.checked ? "series" : "movie"
  const src = ui.txtImdbId.value
  const endpoint =
    type === "movie"
      ? "https://vidsrc.me/embed/movie?imdb="
      : "https://vidsrc.me/embed/tv?imdb="

  ui.iframe.src = endpoint + src
  ui.lblImdbId.textContent = src
  ui.imdbSource.href = "https://www.imdb.com/title/" + src

  const url = new URL(window.location)
  if (type) {
    url.searchParams.set("type", type)
  }

  if (src) {
    url.searchParams.set("src", src)
  }

  saveToHistory(type, src)
  history.pushState(null, "", url)
}

window.onload = () => {
  listHistory = JSON.parse(localStorage.getItem("history")) || []
  updateHistoryView()

  const urlParams = new URLSearchParams(window.location.search)

  const type = urlParams.get("type") || "movie"
  const src = urlParams.get("src") || "tt0311289"

  ui.txtImdbId.value = src
  ui.chckSeries.checked = type === "series"
  onSetSrc()
}

ui.btnToggleHistory.addEventListener("click", () => {
  ui.divHistoryContainer.classList.toggle("hidden")
})

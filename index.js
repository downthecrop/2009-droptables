let allNPCs = null
let allItems = null
let allDrops = null

let debugClass = "debug-hide"
let dropMap = {}

function removeSpaces(str) {
    return str.replaceAll(' ', '').toLowerCase()
}

function genDropMap(dropTable) {
    for (let i = 0; i < dropTable.length; i += 1) {
        dropTable[i]['ids'].split(",").forEach(id => {
            dropMap[id] = i
        })
    }
}

function getItemName(id) {
    return allItems[id]
}

function rarityStyle(percent) {
    if (percent > 99.99)
        return "always"
    if (percent > 4)
        return "common"
    if (percent > 1)
        return "uncommon"
    if (percent > 0.1)
        return "rare"
    return "veryrare"
}

function addDisplayItem(id, min, max, weight, totalWeight) {
    let row = $("<tr></tr>")
    let icon = $("<img>").attr('src', "./items-icons/" + id + ".png")
    let itemName = $("<td>").text(getItemName(id))
    let amount = $("<td>").text((min != max) ? min + "-" + max : min)
    let debug = $("<div>").text("id: " + id).addClass(debugClass)
    let rarity = ""

    // Weights
    if (weight != -1) {
        let percent = (weight / totalWeight) * 100
        rarity = $("<td>").text("1/" + (+parseFloat(100 / percent).toFixed(2).replace(/(\.0+|0+)$/, '')))
            .prop('title', parseFloat((percent).toFixed(2)) + "%")
            .addClass(rarityStyle(percent))
    } else {
        rarity = $("<td>").text("Always").addClass(rarityStyle(100))
    }

    // Edge Cases
    switch (parseInt(id)) {
        case 0:
            icon = icon.attr('src', "./items-icons/nothing.png")
            itemName = itemName.text("Nothing")
            break
        case 1:
            icon = icon.attr('src', "./items-icons/2677.png")
            itemName = itemName.text("Clue Scroll (easy)")
            break
        case 5733:
            icon = icon.attr('src', "./items-icons/2801.png")
            itemName = itemName.text("Clue Scroll (medium)")
            break
        case 12070:
            icon = icon.attr('src', "./items-icons/2722.png")
            itemName = itemName.text("Clue Scroll (hard)")
            break
    }
    return row.append($("<td>").append(icon)).append(itemName.append(debug)).append(amount).append(rarity)[0]
}

function sortByRarity(table, order) {
    let switching = true;
    let shouldSwitch = false;

    while (switching) {
        switching = false
        rows = table.rows;

        for (i = 0; i < (rows.length - 1); i++) {
            let x = rows[i].getElementsByTagName("TD")[3];
            let y = rows[i + 1].getElementsByTagName("TD")[3];

            // Convert text faction to see rarity
            let xEval = parseFloat(x.innerText.split('/')[0] / x.innerText.split('/')[1])
            let yEval = parseFloat(y.innerText.split('/')[0] / y.innerText.split('/')[1])

            if (order) {
                // Rarest LAST
                if (xEval < yEval) {
                    shouldSwitch = true
                    break;
                }
            } else {
                if (xEval > yEval) {
                    shouldSwitch = true
                    break;
                }
            }
            shouldSwitch = false;
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}

function search(e) {
    let searchStr = removeSpaces(e.value)
    let table = document.getElementById("content")
    table.innerHTML = ""

    //Search for matching ID
    Object.keys(allNPCs).forEach(function (npcName) {
        if (searchStr.length > 2 && removeSpaces(npcName).includes(searchStr)) {

            console.log(searchStr + " is like " + npcName)

            let npcEntry = $("<tbody>")
            let npcIds = allNPCs[npcName].split(",")
            let dropGIndex = null

            npcIds.every(id => {
                if (dropMap[id]) {

                    dropGIndex = dropMap[id]

                    // Guaranteed / 'default' drops
                    for (let j = 0; j < allDrops[dropGIndex]['default'].length; j += 1) {
                        let id = allDrops[dropGIndex]['default'][j]["id"]
                        let min = allDrops[dropGIndex]['default'][j]["minAmount"]
                        let max = allDrops[dropGIndex]['default'][j]["maxAmount"]
                        npcEntry.append(addDisplayItem(id, min, max, -1, -1))
                    }

                    // Calculate combined/total weight of all normal drops
                    let totalWeight = 0.0
                    for (let j = 0; j < allDrops[dropGIndex]['main'].length; j += 1) {
                        totalWeight += parseFloat(allDrops[dropGIndex]['main'][j]["weight"])
                    }

                    // Normal drops
                    for (let j = 0; j < allDrops[dropGIndex]['main'].length; j += 1) {
                        let id = allDrops[dropGIndex]['main'][j]["id"]
                        let min = allDrops[dropGIndex]['main'][j]["minAmount"]
                        let max = allDrops[dropGIndex]['main'][j]["maxAmount"]
                        let weight = parseFloat(allDrops[dropGIndex]['main'][j]["weight"])
                        npcEntry.append(addDisplayItem(id, min, max, weight, totalWeight))
                    }
                }
            })
            if (npcEntry) {
                let h1 = $("<h1>").addClass("hover-link").append($("<div>").text(npcName))
                    .on('mouseenter', function () {
                        $(this).text(npcName).append($("<img>").attr('src', "./items-icons/link.png"))
                    })
                    .on('click', function () {
                        window.location = window.location.toString().split('?')[0] + "?" + this.innerText
                    })
                    .on('mouseleave', function () {
                        $(this).find($("img")).remove()
                    })

                table.appendChild($("<div>").append(h1)
                                            .append($("<div>")
                                            .addClass(debugClass)
                                            .append($("<p>")
                                            .text("ids: " + allNPCs[npcName])))[0])

                /*
                // Sort Table on click
                tblBody.addEventListener('click', function (e) {
                    for (i in e.path) {
                        if (e.path[i].tagName == "TBODY") {
                            // Classname is used to track the sorting direction
                            let sortOrder = (e.path[i].className === 'true');
                            e.path[i].className = !sortOrder
                            sortByRarity(e.path[i], !sortOrder)
                            break;
                        }
                    }
                })
                */
                table.appendChild(npcEntry[0])
            }
        }
    })
}

window.addEventListener('load', (event) => {

    async function getNPCIds() {
        const response = await fetch('npc_config.json')
        return await response.json()
    }
    async function getItemIds() {
        const response = await fetch('item_config.json')
        return await response.json()
    }
    async function getDrops() {
        // Mirror fetches changes every 15 minutes from Gitlab
        const response = await fetch('https://downthecrop.github.io/2009scape-mirror/Server/data/configs/drop_tables.json')
        return await response.json()
    }

    // Fetch JSONS
    allItems = getItemIds()
    allNPCs = getNPCIds()
    allDrops = getDrops()

    // Restore Debug setting option
    if (localStorage.getItem('debug') === 'true') {
        document.getElementById("debug-toggle").checked = true;
        debugClass = "debug-show"
    }

    // Toggle Item and NPC ids
    document.getElementById("debug-toggle").addEventListener("change", function () {
        if (this.checked) {
            debugClass = "debug-show"
            $(".debug-hide").attr("class", debugClass)
        } else {
            debugClass = "debug-hide"
            $(".debug-show").attr("class", debugClass)
        }
        localStorage.setItem('debug', this.checked)
    })

    // Startup Init
    let timeout = 0
    let load = setInterval(function () {
        if (allDrops && allNPCs && allItems) {
            clearInterval(load)

            // Hide 'Loading JSON' message, Generate Dropmap for faster searching
            document.getElementsByClassName("loading")[0].setAttribute("style", "display:none;")
            genDropMap(allDrops)

            // Load directly linked monster if there is a search
            if (window.location.search) {
                document.getElementsByTagName("input")[0].value = window.location.search.substring(1).replaceAll("%20", " ")
                search(document.getElementsByTagName("input")[0])
            }
        }
        // If loading JSONs takes longer than 600ms, show 'Loading JSON' message 
        if (timeout > 6)
            document.getElementsByClassName("loading")[0].setAttribute("style", "display:block;")
        timeout += 1
    }, 100)
})
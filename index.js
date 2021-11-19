let npcG, itemG, dropG

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
    return itemG[id]
}

function getRarityStyle(chance) {
    if (chance > 99.99) {
        return "always"
    } else if (chance > 4) {
        return "common"
    } else if (chance > 1) {
        return "uncommon"
    } else if (chance > 0.1) {
        return "rare"
    } else {
        return "veryrare"
    }
}

function addDisplayItem(id, min, max, weight, totalWeight) {
    let row = $("<tr></tr>")
    let icon = $("<img>").attr('src', "./items-icons/" + id + ".png");
    let itemName = $("<td>").text(getItemName(id));
    let amount = $("<td>").text((min != max) ? min + "-" + max : min)

    // Weighting
    let rarity
    if (weight != -1) {
        let percent = (weight / totalWeight) * 100
        rarity = $("<td>").text("1/" + (+parseFloat(100 / percent).toFixed(2).replace(/(\.0+|0+)$/, '')))
            .prop('title', parseFloat((percent).toFixed(2)) + "%")
            .addClass(getRarityStyle(percent))
    } else {
        rarity = $("<td>").text("Always")
            .addClass(getRarityStyle(100))
    }

    // Edge Cases
    switch (parseInt(id)) {
        case 0:
            icon = icon.attr('src', "./items-icons/nothing.png")
            itemName = itemName.text("Nothing")
            break;
        case 1:
            icon = icon.attr('src', "./items-icons/2677.png")
            itemName = itemName.text("Clue Scroll (easy)")
            break;
        case 5733:
            icon = icon.attr('src', "./items-icons/2801.png")
            itemName = itemName.text("Clue Scroll (medium)")
            break;
        case 12070:
            icon = icon.attr('src', "./items-icons/2722.png")
            itemName = itemName.text("Clue Scroll (hard)")
            break;
    }

    // Debug item Ids
    let debug = $("<div>").text("id: " + id)
        .addClass(debugClass)

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
    let table = document.getElementById("table")
    table.innerHTML = ""

    //Search for matching ID
    Object.keys(npcG).forEach(function (npcName) {
        if (searchStr.length > 2 && removeSpaces(npcName).includes(searchStr)) {

            console.log(searchStr + " is like " + npcName)

            let tblBody = document.createElement("tbody");
            let npcID = npcG[npcName].split(",")

            npcID.every(id => {
                if (dropMap[id]) {
                    i = dropMap[id]
                    // Get the combined weight of everything for later
                    // Iterating the loop 2 times.. maybe don't do this at home.
                    let totalWeight = 0.0;
                    for (let j = 0; j < dropG[i]['main'].length; j += 1) {
                        totalWeight += parseFloat(dropG[i]['main'][j]["weight"])
                    }

                    // Guarantee/Default Droptable Items
                    for (let j = 0; j < dropG[i]['default'].length; j += 1) {
                        let id = dropG[i]['default'][j]["id"]
                        let min = dropG[i]['default'][j]["minAmount"]
                        let max = dropG[i]['default'][j]["maxAmount"]
                        tblBody.appendChild(addDisplayItem(id, min, max, -1, totalWeight));
                    }

                    // Normal Droptable Items
                    for (let j = 0; j < dropG[i]['main'].length; j += 1) {
                        let id = dropG[i]['main'][j]["id"]
                        let min = dropG[i]['main'][j]["minAmount"]
                        let max = dropG[i]['main'][j]["maxAmount"]
                        let weight = parseFloat(dropG[i]['main'][j]["weight"])
                        tblBody.appendChild(addDisplayItem(id, min, max, weight, totalWeight));
                    }
                }
            })
            if (tblBody.innerText) {
                let h1 = document.createElement("h1")
                h1.className = "hover-link"
                debugDiv = document.createElement('div')
                debugDiv.className = debugClass
                debugText = document.createElement('p');
                debugText.innerHTML = ("ids: " + npcG[npcName]);
                debugDiv.appendChild(debugText)
                h1.innerText = npcName
                table.appendChild(h1)
                table.appendChild(debugDiv)

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

                // Direct linking tooltip
                h1.addEventListener('mouseenter', function (e) {
                    let linkimg = document.createElement("img");
                    linkimg.src = "./items-icons/link.png"
                    linkimg.style.display = "inline"
                    this.appendChild(linkimg);
                })
                h1.addEventListener('click', function (e) {
                    let strip = window.location.toString().split('?')
                    window.location = strip[0] + "?" + this.innerText
                })
                h1.addEventListener('mouseleave', function (e) {
                    let child = this.getElementsByTagName("img")[0]
                    this.removeChild(child)
                })

                // Add Table to page, continue to next Match in Keys
                table.appendChild(tblBody)
            }
        }
    });
}

window.addEventListener('load', (event) => {

    async function getNPCIds() {
        const response = await fetch('npc_config.json');
        return await response.json();
    }
    async function getItemIds() {
        const response = await fetch('item_config.json');
        return await response.json();
    }
    async function getDrops() {
        // Mirror fetches changes every 15 minutes from Gitlab
        const response = await fetch('https://downthecrop.github.io/2009scape-mirror/Server/data/configs/drop_tables.json');
        return await response.json();
    }

    // Fetch JSONS
    getItemIds().then(itemJ => { itemG = itemJ })
    getNPCIds().then(npcJ => { npcG = npcJ })
    getDrops().then(dropJ => { dropG = dropJ })

    // Restore Debug setting option
    if (localStorage.getItem('debug') === 'true') {
        document.getElementById("debug-toggle").checked = true;
        debugClass = "debug-show"
    }

    // Toggle Item and NPC ids
    document.getElementById("debug-toggle").addEventListener("change", function () {
        if (this.checked) {
            const debug = document.querySelectorAll('.debug-hide');
            debugClass = "debug-show"
            debug.forEach(element => {
                element.className = debugClass;
            });
        }
        else {
            const debug = document.querySelectorAll('.debug-show');
            debugClass = "debug-hide"
            debug.forEach(element => {
                element.className = debugClass;
            });
        }
        localStorage.setItem('debug', this.checked);
    })

    // Startup Init
    let timeout = 0;
    let checkExist = setInterval(function () {
        if (dropG != undefined && npcG != undefined && itemG != undefined) {
            clearInterval(checkExist);

            // Hide 'Loading JSON' message, Generate Dropmap for faster searching
            document.getElementsByClassName("loading")[0].setAttribute("style", "display:none;")
            genDropMap(dropG)

            // Load directly linked monster if there is a search
            if (window.location.search) {
                document.getElementsByTagName("input")[0].value = window.location.search.substring(1).replaceAll("%20", " ")
                search(document.getElementsByTagName("input")[0])
            }
        }

        // If loading JSONs takes longer than 600ms, show 'Loading JSON' message 
        if (timeout > 6)
            document.getElementsByClassName("loading")[0].setAttribute("style", "display:block;")
            timeout += 1;
    }, 100);
});
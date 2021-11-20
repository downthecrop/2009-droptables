let npcG, itemNameMap, dropG

let npcArray = []
let npcNamesMap = {}

class npcObject {
    constructor(ids, name) {
      this.ids = ids;
      this.name = name;
      this.totalWeight = 0
      this.default = []
      this.main = []
    }
}

function sortByRarity(table, order) {
    let switching = true;
    let shouldSwitch = false;

    while (switching) {
        switching = false
        rows = table.rows;

        for (i = 0; i < (rows.length - 1); i++) {
            let x = rows[i].getElementsByTagName("TD")[4];
            let y = rows[i + 1].getElementsByTagName("TD")[4];

            // Convert text faction to see rarity
            let xEval = parseFloat(x.innerText.split('/')[0] / x.innerText.split('/')[1])
            let yEval = parseFloat(y.innerText.split('/')[0] / y.innerText.split('/')[1])

            // Handle Always
            if(!x.innerText.includes("/")){
                xEval = 999
            }
            if(!y.innerText.includes("/")){
                yEval = 999
            }

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

let debugClass = "debug-hide"
let dropMap = {}
let itemMap = {}
let allNPCs = {}

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

function prettyName(itemName){
    let pretty = ""
    let parts = itemName.split("_")
    let i = 0
    while (i < parts.length){
        let part = parts[i]
        pretty += part[0].toUpperCase() + part.substring(1)
        i += 1
        if(i < parts.length)
            pretty += " "
    }
    return pretty
}

function addDisplayItem(name,id, min, max, weight, totalWeight) {
    let row = $("<tr></tr>")
    let icon = $("<img>").attr('src', "./items-icons/" + id + ".png")
    let itemName = $("<td>").text(getItemName(id))
    let npcName = $("<td>").text(name)
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
    return row.append(npcName).append($("<td>").append(icon)).append(itemName.append(debug)).append(amount).append(rarity)[0]
}

function replaceSpaces(str) {
    return str.replaceAll(' ', '_').toLowerCase()
}
function getItemName(id) {
    return itemNameMap[id]
}
function getNPCName(id) {
    return npcNamesMap[id]
}

function genItemMap(dropTable) {
    for (let i = 0; i < dropTable.length; i += 1) {

        let name = getNPCName(dropTable[i].ids.split(",")[0])
        let npc = new npcObject(dropTable[i].ids,name)

        // Add default drops
        dropTable[i]['default'].forEach(obj => {

            if (itemMap[replaceSpaces(getItemName(obj.id))])
                itemMap[replaceSpaces(getItemName(obj.id))] += ("," + dropTable[i]['ids'])
            else
                itemMap[replaceSpaces(getItemName(obj.id))] = dropTable[i]['ids']

            obj.always = true
            npc.default.push(obj)
            npc[replaceSpaces(getItemName(obj.id))] = [obj]
        })

        // Normal drops
        dropTable[i]['main'].forEach(obj => {
            npc.totalWeight += parseFloat(obj.weight)
            if (itemMap[replaceSpaces(getItemName(obj.id))])
                itemMap[replaceSpaces(getItemName(obj.id))] += ("," + dropTable[i]['ids'])
            else
                itemMap[replaceSpaces(getItemName(obj.id))] = dropTable[i]['ids']
            
            npc.main.push(obj)
            if(npc[replaceSpaces(getItemName(obj.id))])
                npc[replaceSpaces(getItemName(obj.id))].push(obj)
            else
                npc[replaceSpaces(getItemName(obj.id))] = [obj]
        })
        allNPCs[name] = npc
    }
}


function genNPCNameMap(npcs){
    Object.keys(npcs).forEach(function(npcName) {
        let npcIDs = npcs[npcName].split(",")
        npcIDs.every(id => npcNamesMap[id] = npcName)
    })
}

function search(e) {
    let searchStr = replaceSpaces(e.value)
    let table = document.getElementById("content")
    table.innerHTML = ""


    
    //Search for matching ID
    Object.keys(itemMap).forEach(itemName => {
        let itemEntry = $("<tbody>")
        if (searchStr.length > 3 && itemName.includes(searchStr)) {
            console.log(searchStr + " is like " + itemName)

            let npcName = ""
            let npcID = itemMap[replaceSpaces(itemName)].split(",")
            for(let i = 0; i < npcID.length; i += 1){
                if (getNPCName(npcID[i]) != npcName && getNPCName(npcID[i]) != undefined){
                    npcName = getNPCName(npcID[i])
                    // For monsters dropping the same ID in different ways (count) increment index
                    try{allNPCs[npcName][itemName].every(item => {
                        //console.log(allNPCs[npcName][itemName])
                        if(item.always)
                            item.weight = -1
                        itemEntry.append(addDisplayItem(npcName,item.id, item.minAmount, item.maxAmount, item.weight, allNPCs[npcName].totalWeight))
                    })} catch(e)
                    {
                        console.log("error in" + e)
                    }
                } 
            }
            if(itemEntry){
                let h1 = $("<h1>").addClass("hover-link").append($("<div>").text(prettyName(itemName)))
                    .on('mouseenter', function () {
                        $(this).text(prettyName(itemName)).append($("<img>").attr('src', "./items-icons/link.png"))
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
                                            .text("NPC ids: " + npcID)))[0])


                itemEntry.on('click', function (e) {
                    //console.log(e)
                    e = e.currentTarget
                    // Classname is used to track the sorting direction
                    let sortOrder = (e.className === 'true');
                    e.className = !sortOrder
                    sortByRarity(e, !sortOrder)
                })
                            
                table.append(itemEntry[0])
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
    getItemIds().then(itemJ => { itemNameMap = itemJ })
    getNPCIds().then(npcJ => { npcG = npcJ })
    getDrops().then(dropJ => { dropG = dropJ })

    // Restore Debug option
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
    let counter = 0;
    let checkExist = setInterval(function () {
        if (dropG != undefined && npcG != undefined && itemNameMap != undefined) {
            clearInterval(checkExist);

            // Hide 'Loading JSON' message, Generate Dropmap for faster searching
            document.getElementsByClassName("loading")[0].setAttribute("style", "display:none;")
            genNPCNameMap(npcG)
            genItemMap(dropG)
            
            // Load directly linked monster if there is a search
            if (window.location.search) {
                document.getElementsByTagName("input")[0].value = window.location.search.substring(1).replaceAll("%20", " ")
                search(document.getElementsByTagName("input")[0])
            }
        }

        // If loading JSONs takes longer than 600ms, show 'Loading JSON' message 
        if (counter > 6)
            document.getElementsByClassName("loading")[0].setAttribute("style", "display:block;")
        counter += 1;
    }, 100);

});
let npcG, itemG, dropG

let debugClass = "debug-hide"
let dropMap = {}
let itemMap = {}
let npcMap = {}

function replaceSpaces(str) {
    return str.replaceAll(' ', '_').toLowerCase()
}

function getItemName(id) {
    return itemG[id]
}

function getNPCName(id) {
    return npcMap[id]
}

function genItemMap(dropTable) {
    for (let i = 0; i < dropTable.length; i += 1) {
        //Default Drops
        dropTable[i]['default'].forEach(obj => {
            console.log(obj.id)
            if (itemMap[replaceSpaces(getItemName(obj.id))])
                itemMap[replaceSpaces(getItemName(obj.id))] += ("," + dropTable[i]['ids'])
            else
                itemMap[replaceSpaces(getItemName(obj.id))] = dropTable[i]['ids']
        })

        //Normal Drops
        dropTable[i]['main'].forEach(obj => {
            if (itemMap[replaceSpaces(getItemName(obj.id))])
                itemMap[replaceSpaces(getItemName(obj.id))] += ("," + dropTable[i]['ids'])
            else
                itemMap[replaceSpaces(getItemName(obj.id))] = dropTable[i]['ids']
    })
    //console.log(itemMap)
}}


function genNPCMap(npcs){
    Object.keys(npcs).forEach(function(npcName) {
        let npcIDs = npcs[npcName].split(",")
        npcIDs.every(id => npcMap[id] = npcName)
    })
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
            let xNums = x.innerText.split('/')
            let yNums = y.innerText.split('/')
            let xEval = parseFloat(xNums[0] / xNums[1])
            let yEval = parseFloat(yNums[0] / yNums[1])

            if (order) {
                // Rarest LAST
                if (xEval < yEval) {
                    shouldSwitch = true
                    break;
                }
            }
            else {
                // Rarest FIRST
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
    let searchStr = replaceSpaces(e.value)
    let table = document.getElementById("table")
    table.innerHTML = ""

    //Search for matching ID
    Object.keys(itemMap).forEach(function (itemName) {
        if (searchStr.length > 2 && itemName.includes(searchStr)) {
            let i = null;
            console.log(searchStr + " is like " + itemName)

            let tblBody = document.createElement("tbody");
    
            console.log(replaceSpaces(itemName))
            console.log(itemMap[replaceSpaces(itemName)])

            let npcID = itemMap[replaceSpaces(itemName)].split(",")

            table.innerHTML += "<h1>" +itemName+ "</h1>"

            let last = ""
            for(let i = 0; i < npcID.length; i += 1){
                if (getNPCName(npcID[i]) != last && getNPCName(npcID[i]) != undefined){
                    table.innerHTML += getNPCName(npcID[i])+","
                    last = getNPCName(npcID[i])
                }   
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
        if (dropG != undefined && npcG != undefined && itemG != undefined) {
            clearInterval(checkExist);

            // Hide 'Loading JSON' message, Generate Dropmap for faster searching
            document.getElementsByClassName("loading")[0].setAttribute("style", "display:none;")
            genItemMap(dropG)
            genNPCMap(npcG)


            // Load directly linked monster if there is a search
            if (window.location.search) {
                document.getElementsByTagName("input")[0].value = window.location.search.substring(1).replaceAll("%20", " ")
                search(document.getElementsByTagName("input")[0])
            }
            //console.log(dropG,npcG,itemG)
        }

        // If loading JSONs takes longer than 600ms, show 'Loading JSON' message 
        if (counter > 6)
            document.getElementsByClassName("loading")[0].setAttribute("style", "display:block;")
        counter += 1;
    }, 100);

});
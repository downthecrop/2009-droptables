var npcG
var dropG
var itemG
var debugClass = "debug"
var indexedDrops = {}

function sanitize(str){
    return str.replace(' ','').toLowerCase()
}

function genDropIndex(dropTable){
    for (let i = 0; i < dropTable.length; i += 1){
        dropTable[i]['ids'].split(",").forEach(id => {
            indexedDrops[id] = i
        })
    }
}

function search(e){
    let searchStr = sanitize(e.value)
    console.log(searchStr)
    let table = document.getElementById("table")
    table.innerHTML = ""
    //Search for matching ID
    Object.keys(npcG).forEach(function(npcName) {
        if (searchStr.length > 2 && sanitize(npcName).includes(searchStr)){
            console.log(searchStr + " is like "+npcName)
            var tblBody = document.createElement("tbody");
            
            let npcID = npcG[npcName].split(",")

            let flag = false

            npcID.every(id => {
                if(indexedDrops[id] !== undefined){
                    flag = true;
                    i = indexedDrops[id]
                    return true
                }
            })
            if (flag){
                // Get the combined weight of everything for later
                // Iterating the loop 2 times.. maybe don't do this at home.
                let totalWeight = 0.0;
                for (let j = 0; j < dropG[i]['main'].length; j += 1){
                    totalWeight += parseFloat(dropG[i]['main'][j]["weight"])
                }
                
                // Guarantee/Default Droptable Items
                for (let j = 0; j < dropG[i]['default'].length; j += 1){
                    var row = document.createElement("tr");
                    var cell = document.createElement("td");

                    // Icon Cell
                    const itemIcon = document.createElement("img");
                    itemIcon.src = "./items-icons/" + dropG[i]['default'][j]["id"] + ".png"
                    cell.appendChild(itemIcon);
                    row.appendChild(cell)

                    // Item Name Cell
                    var cell = document.createElement("td");
                    var cellText = document.createTextNode(itemG[dropG[i]['default'][j]["id"]]);
                    var debugDiv = document.createElement('div');
                    var debugText = document.createTextNode("id: "+dropG[i]['default'][j]["id"]);
                    debugDiv.className = debugClass
                    debugDiv.appendChild(debugText)
                    cell.appendChild(cellText);
                    cell.appendChild(debugDiv);
                    row.append(cell)

                    // Quantity
                    var cell = document.createElement("td");
                    if (dropG[i]['default'][j]["minAmount"] != dropG[i]['default'][j]["maxAmount"]){
                        amount = dropG[i]['default'][j]["minAmount"] + "-" + dropG[i]['default'][j]["maxAmount"]
                    } else {
                        amount = dropG[i]['default'][j]["minAmount"]
                    }
                    var cellText = document.createTextNode(amount);
                    cell.appendChild(cellText);
                    row.append(cell)

                    // Rarity (Always)
                    var cell = document.createElement("td");
                    var cellText = document.createTextNode("Always");
                    cell.className = "always"
                    cell.appendChild(cellText);
                    row.append(cell)

                    // Append the TD items to the Row
                    tblBody.appendChild(row);
                }


                // Normal Droptable Items
                for (let j = 0; j < dropG[i]['main'].length; j += 1){
                    if(dropG[i]['main'][j]["id"] == "0")
                        continue
                    var row = document.createElement("tr");
                    var cell = document.createElement("td");

                    // Icon Cell
                    const itemIcon = document.createElement("img");
                    itemIcon.src = "./items-icons/" + dropG[i]['main'][j]["id"] + ".png"
                    cell.appendChild(itemIcon);
                    row.appendChild(cell)

                    // Item Name Cell
                    var cell = document.createElement("td");
                    var cellText = document.createTextNode(itemG[dropG[i]['main'][j]["id"]]);
                    var debugDiv = document.createElement('div');
                    var debugText = document.createTextNode("id: "+dropG[i]['main'][j]["id"]);
                    debugDiv.className = debugClass
                    debugDiv.appendChild(debugText)
                    cell.appendChild(cellText);
                    cell.appendChild(debugDiv)
                    row.append(cell)

                    // Quantity
                    var cell = document.createElement("td");
                    if (dropG[i]['main'][j]["minAmount"] != dropG[i]['main'][j]["maxAmount"]){
                        amount = dropG[i]['main'][j]["minAmount"] + "-" + dropG[i]['main'][j]["maxAmount"]
                    } else {
                        amount = dropG[i]['main'][j]["minAmount"]
                    }
                    var cellText = document.createTextNode(amount);
                    cell.appendChild(cellText);
                    row.append(cell)

                    // Rarity
                    let weight = parseFloat(dropG[i]['main'][j]["weight"])
                    var cell = document.createElement("td");
                    var chance = (weight/totalWeight)*100
                    // Remove trailing zeros (Tried a bunch of stuff and couldn't get it out without)
                    var cellText = document.createTextNode("1/"+(+parseFloat(100/chance).toFixed(2).replace(/(\.0+|0+)$/, '')));
                    if (chance > 99.99){
                        cell.className = "always"
                    } else if (chance > 4){
                        cell.className = "common"
                    } else if (chance > 1) {
                        cell.className = "uncommon"
                    } else if (chance > 0.1){
                        cell.className = "rare"
                    } else {
                        cell.className = "veryrare"
                    }
                    cell.title = parseFloat((chance).toFixed(2)) + "%"
                    cell.appendChild(cellText);
                    row.append(cell)

                    // Append the TD items to the Row
                    tblBody.appendChild(row);
                }
            }
            if (tblBody.innerText){
                let h1 = document.createElement("h1")
                let debugDiv = document.createElement('div')
                debugDiv.className = debugClass
                var debugText = document.createElement('p');
                debugText.innerHTML = ("ids: "+npcG[npcName]);
                debugDiv.appendChild(debugText)
                h1.innerText = npcName
                table.appendChild(h1)
                table.appendChild(debugDiv)
                document.getElementById("table").appendChild(tblBody)
            }
        }
    });
}

window.addEventListener('load', (event) => {
    const queryString = window.location.search;
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

    // Toggle Item and NPC ids
    document.getElementById("debug-toggle").addEventListener("change", function(){
        if (this.checked){
            const debug = document.querySelectorAll('.debug');
            debugClass = "debug-show"
            debug.forEach(element => {
                element.className = debugClass;
            });
        }
        else{
            const debug = document.querySelectorAll('.debug-show');
            debugClass = "debug"
            debug.forEach(element => {
                element.className = debugClass;
            });
        }
    })

    // Fetch JSONS
    function main(){
        getItemIds().then(itemJ => {itemG = itemJ})
        getNPCIds().then(npcJ => {npcG = npcJ})
        getDrops().then(dropJ => {dropG = dropJ})
    }
    main();

    //Loading GUI
    let counter = 0;
    let checkExist = setInterval(function () {
        if (dropG != undefined && npcG != undefined && itemG != undefined) {
            clearInterval(checkExist);
            document.getElementsByClassName("loading")[0].setAttribute("style","display:none;")
            genDropIndex(dropG)

            //Allow users to directly link a table
            if(window.location.search){
                document.getElementsByTagName("input")[0].value = window.location.search.substring(1)
                search(document.getElementsByTagName("input")[0])
            }
        }
        if (counter > 6)
            document.getElementsByClassName("loading")[0].setAttribute("style","display:block;")
        counter += 1;
    }, 100);

});
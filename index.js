let npcG, itemG, dropG

let debugClass = "debug-hide"
let dropMap = {}

function sanitize(str){
    return str.replaceAll(' ','').toLowerCase()
}

function genDropMap(dropTable){
    for (let i = 0; i < dropTable.length; i += 1){
        dropTable[i]['ids'].split(",").forEach(id => {
            dropMap[id] = i
        })
    }
}

function sortByRarity(table,order){
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
            let xEval = parseFloat(xNums[0]/xNums[1])
            let yEval = parseFloat(yNums[0]/yNums[1])

            if (order){
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

function search(e){
    let searchStr = sanitize(e.value)
    let table = document.getElementById("table")
    table.innerHTML = ""

    //Search for matching ID
    Object.keys(npcG).forEach(function(npcName) {
        if (searchStr.length > 2 && sanitize(npcName).includes(searchStr)){
            
            console.log(searchStr + " is like "+npcName)

            let tblBody = document.createElement("tbody");
            let npcID = npcG[npcName].split(",")
            let flag = false

            npcID.every(id => {
                if(dropMap[id]){
                    flag = true;
                    i = dropMap[id]
                    return true
                }
            })

            if (flag){
                // Get the combined weight of everything for later
                // Iterating the loop 2 times.. maybe don't do this at home.
                let totalWeight = 0.0;
                let row, cell, cellText, debugDiv, debugText
                for (let j = 0; j < dropG[i]['main'].length; j += 1){
                    totalWeight += parseFloat(dropG[i]['main'][j]["weight"])
                }
                
                // Guarantee/Default Droptable Items
                for (let j = 0; j < dropG[i]['default'].length; j += 1){
                    row = document.createElement("tr");
                    cell = document.createElement("td");

                    // Icon Cell
                    const itemIcon = document.createElement("img");
                    itemIcon.src = "./items-icons/" + dropG[i]['default'][j]["id"] + ".png"
                    cell.appendChild(itemIcon);
                    row.appendChild(cell)

                    // Item Name Cell
                    cell = document.createElement("td");
                    cellText = document.createTextNode(itemG[dropG[i]['default'][j]["id"]]);
                    debugDiv = document.createElement('div');
                    debugText = document.createTextNode("id: "+dropG[i]['default'][j]["id"]);
                    debugDiv.className = debugClass
                    debugDiv.appendChild(debugText)
                    cell.appendChild(cellText);
                    cell.appendChild(debugDiv);
                    row.append(cell)

                    // Quantity
                    if (dropG[i]['default'][j]["minAmount"] != dropG[i]['default'][j]["maxAmount"]){
                        amount = dropG[i]['default'][j]["minAmount"] + "-" + dropG[i]['default'][j]["maxAmount"]
                    } else {
                        amount = dropG[i]['default'][j]["minAmount"]
                    }
                    cell = document.createElement("td");
                    cellText = document.createTextNode(amount);
                    cell.appendChild(cellText);
                    row.append(cell)

                    // Rarity (Always)
                    cell = document.createElement("td");
                    cellText = document.createTextNode("Always");
                    cell.className = "always"
                    cell.appendChild(cellText);
                    row.append(cell)

                    // Append the TD items to the Row
                    tblBody.appendChild(row);
                }


                // Normal Droptable Items
                for (let j = 0; j < dropG[i]['main'].length; j += 1){
                    row = document.createElement("tr");
                    cell = document.createElement("td");

                    // Icon Cell
                    const itemIcon = document.createElement("img");
                    itemIcon.src = "./items-icons/" + dropG[i]['main'][j]["id"] + ".png"
                    cell.appendChild(itemIcon);
                    row.appendChild(cell)

                    // Item Name Cell
                    cell = document.createElement("td");
                    cellText = document.createTextNode(itemG[dropG[i]['main'][j]["id"]]);

                    // Edge cases for cell names
                    // e.g Case for the 'Nothing' entry in table (Shows as Dwarf Remains otherwise)
                    // Re-write image and text to represent the differed value
                    if(dropG[i]['main'][j]["id"] == "0"){
                        row.getElementsByTagName('img')[0].src = "./items-icons/nothing.png"
                        cellText = document.createTextNode("Nothing")
                    }
                    if(dropG[i]['main'][j]["id"] == "1"){
                        row.getElementsByTagName('img')[0].src = "./items-icons/2677.png"
                        cellText = document.createTextNode("Clue Scroll (easy)")
                    }
                    if(dropG[i]['main'][j]["id"] == "5733"){
                        row.getElementsByTagName('img')[0].src = "./items-icons/2801.png"
                        cellText = document.createTextNode("Clue Scroll (medium)")
                    }
                    if(dropG[i]['main'][j]["id"] == "12070"){
                        row.getElementsByTagName('img')[0].src = "./items-icons/2722.png"
                        cellText = document.createTextNode("Clue Scroll (hard)")               
                    }
                    
                    // Add Debug ID to Name
                    debugDiv = document.createElement('div');
                    debugText= document.createTextNode("id: "+dropG[i]['main'][j]["id"]);
                    debugDiv.className = debugClass
                    debugDiv.appendChild(debugText)
                    cell.appendChild(cellText);
                    cell.appendChild(debugDiv)
                    row.append(cell)

                    // Quantity
                    cell = document.createElement("td");
                    if (dropG[i]['main'][j]["minAmount"] != dropG[i]['main'][j]["maxAmount"]){
                        amount = dropG[i]['main'][j]["minAmount"] + "-" + dropG[i]['main'][j]["maxAmount"]
                    } else {
                        amount = dropG[i]['main'][j]["minAmount"]
                    }
                    cellText = document.createTextNode(amount);
                    cell.appendChild(cellText);
                    row.append(cell)

                    // Rarity
                    let weight = parseFloat(dropG[i]['main'][j]["weight"])
                    let chance = (weight/totalWeight)*100
                    cell = document.createElement("td");

                    // Remove trailing zeros (Tried a bunch of stuff and couldn't get it out without)
                    cellText = document.createTextNode("1/"+(+parseFloat(100/chance).toFixed(2).replace(/(\.0+|0+)$/, '')));

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
                h1.className = "hover-link"
                debugDiv = document.createElement('div')
                debugDiv.className = debugClass
                debugText= document.createElement('p');
                debugText.innerHTML = ("ids: "+npcG[npcName]);
                debugDiv.appendChild(debugText)
                h1.innerText = npcName
                table.appendChild(h1)
                table.appendChild(debugDiv)

                // Sort Table on click
                tblBody.addEventListener('click', function(e){
                    for (i in e.path){
                        if(e.path[i].tagName == "TBODY"){
                            // Classname is used to track the sorting direction
                            let sortOrder = (e.path[i].className === 'true');
                            e.path[i].className = !sortOrder
                            sortByRarity(e.path[i],!sortOrder)
                            break;
                        }
                    }
                })

                // Direct linking tooltip
                h1.addEventListener('mouseenter', function(e){
                    let linkimg = document.createElement("img");
                    linkimg.src = "./items-icons/" + "link.png"
                    linkimg.style.display = "inline"
                    this.appendChild(linkimg);
                })
                h1.addEventListener('click', function(e){
                    let strip = window.location.toString().split('?')
                    window.location = strip[0] + "?" + this.innerText
                })
                h1.addEventListener('mouseleave', function(e){
                    let child = this.getElementsByTagName("img")[0]
                    this.removeChild(child)
                })

                // Add Table to page, continuue to next Match in Keys
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
    getItemIds().then(itemJ => {itemG = itemJ})
    getNPCIds().then(npcJ => {npcG = npcJ})
    getDrops().then(dropJ => {dropG = dropJ})
    
    // Restore Debug option
    if(localStorage.getItem('debug') === 'true'){
        document.getElementById("debug-toggle").checked = true;
        debugClass = "debug-show"
    }

    // Toggle Item and NPC ids
    document.getElementById("debug-toggle").addEventListener("change", function(){
        if (this.checked){
            const debug = document.querySelectorAll('.debug-hide');
            debugClass = "debug-show"
            debug.forEach(element => {
                element.className = debugClass;
            });
        }
        else{
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
            document.getElementsByClassName("loading")[0].setAttribute("style","display:none;")
            genDropMap(dropG)

            // Load directly linked monster if there is a search
            if(window.location.search){
                document.getElementsByTagName("input")[0].value = window.location.search.substring(1).replaceAll("%20"," ")
                search(document.getElementsByTagName("input")[0])
            }
        }

        // If loading JSONs takes longer than 600ms, show 'Loading JSON' message 
        if (counter > 6)
            document.getElementsByClassName("loading")[0].setAttribute("style","display:block;")
        counter += 1;
    }, 100);

});
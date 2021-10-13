var npcG
var dropG
var itemG = {}

function test(e){
    let value = e.value
    let table = document.getElementById("table")
    table.innerHTML = ""
    //Search for matching ID
    Object.keys(npcG).forEach(function(key) {
        if (value.length > 2 && key.toLowerCase().includes(e.value.toLowerCase())){
            for (let i = 0; i < dropG.length; i += 1){
                if (npcG[key].includes(dropG[i]['ids'])){

                    // creates a <table> element and a <tbody> element
                    var tblBody = document.createElement("tbody");

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
                        cell.appendChild(cellText);
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
                        cell.bgColor = "#AFEEEE"
                        cell.appendChild(cellText);
                        row.append(cell)

                        // Append the TD items to the Row
                        tblBody.appendChild(row);
                    }


                    // Normal Droptable Items
                    for (let j = 0; j < dropG[i]['main'].length; j += 1){
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
                        cell.appendChild(cellText);
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
                        var frac = new Fraction(chance/100)
                        if (""+frac == "1"){
                            var cellText = document.createTextNode("Always");
                        } else {
                            var cellText = document.createTextNode("1/"+parseFloat((frac.denominator/frac.numerator).toFixed(2)));
                        }
                        if (weight > 99.99){
                            cell.bgColor = "#AFEEEE"
                        } else if (weight > 4){
                            cell.bgColor = "#56E156"
                        } else if (weight > 1) {
                            cell.bgColor = "#FFED4C"
                        } else if (weight > 0.1){
                            cell.bgColor = "#FF863C"
                        } else {
                            cell.bgColor = "#FF6262"
                        }
                        cell.title = parseFloat((chance).toFixed(2)) + "%"
                        cell.appendChild(cellText);
                        row.append(cell)

                        // Append the TD items to the Row
                        tblBody.appendChild(row);
                    }
                }
            }
            if (tblBody.innerText != ""){
                let h1 = document.createElement("h1")
                h1.innerText = key
                table.appendChild(h1)
                document.getElementById("table").appendChild(tblBody)
            }
        }
    });
}

window.addEventListener('load', (event) => {
    async function getNPCIds() {
        const response = await fetch('./npc_config.json');
        return await response.json();
    }
    async function getItemIds() {
        const response = await fetch('./item_configs.json');
        return await response.json();
    }
    async function getDrops() {
        // CORS error prevents referencing the gitLAB json directly. Github mirror instead (auto syncs every 15 minutes).
        let link = "https://raw.githubusercontent.com/downthecrop/2009scape-mirror/master/Server/data/configs/drop_tables.json"
        $.ajax({
            method: 'GET',
            url: link,
            dataType: 'jsonp', //change the datatype to 'jsonp' works in most cases
            success: (res) => {
             return res;
            }
          })
    }
    function main(){
        getNPCIds().then(npcJ => {npcG = npcJ})
        getDrops().then(dropJ => {dropG = dropJ})
        getItemIds().then(itemJ => {
            for (let i = 0; i < itemJ.length; i += 1){
                itemG[itemJ[i]["id"]] = itemJ[i]["name"]
            }
        })
    }
    main();
});
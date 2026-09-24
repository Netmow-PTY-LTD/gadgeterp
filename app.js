
function load(){
let html="";
devices.forEach((d,i)=>{
html+=`<tr>
<td>${d.name}</td>
<td>${d.imei}</td>
<td>RM ${d.cost}</td>
<td>${d.status}</td>
<td><button class="btn btn-danger btn-sm" onclick="remove(${i})">Delete</button></td>
</tr>`;
});
document.getElementById("devices").innerHTML=html;
}
function addDevice(){
document.getElementById("modal").style.display="block";
}
function saveDevice(){
devices.push({
name:name.value,
imei:imei.value,
cost:cost.value,
status:"Available"
});
document.getElementById("modal").style.display="none";
load();
}
function remove(i){
devices.splice(i,1);
load();
}
new Chart(document.getElementById("salesChart"),{
type:"line",
data:{
labels:["Jan","Feb","Mar","Apr","May"],
datasets:[{label:"Sales",data:[12000,18000,22000,28000,35000]}]
}
});
load();

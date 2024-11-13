let lists=document.getElementsByClassName("list")

let leftBox=document.getElementById("left")
let rightBox=document.getElementById("right")
let centerBox=document.getElementById("center")




for(let list of lists){
    list.addEventListener("dragstart",function(e){
        let selected=e.target;
        leftBox.addEventListener("dragover",function(e){
            e.preventDefault();
        })
        leftBox.addEventListener("drop",function(e){

            leftBox.appendChild(selected)
            selected=null;
        })
        rightBox.addEventListener("dragover",function(e){
            e.preventDefault();
        })
        rightBox.addEventListener("drop",function(e){

            rightBox.appendChild(selected)
            selected=null;
        })
        centerBox.addEventListener("dragover",function(e){
            e.preventDefault();
        })
        centerBox.addEventListener("drop",function(e){

            centerBox.appendChild(selected)
            selected=null;
        })
    })
}

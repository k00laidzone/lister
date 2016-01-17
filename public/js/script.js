$('#store').on('change',function(){
  $.get('/changestore/'+this.value,function(data){
    $('#dept').contents().remove();
    for(var j = 0; j < data.length; j++)
    {
      var newOption = document.createElement("option");
      newOption.text = data[j].deptName;
      newOption.value = data[j]._id;
      $('#dept').append(newOption);
    }
  });
});



//Top menu management on the list page.
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
} 

$("#topmenu").on('hidden.bs.collapse', function(){
    //alert('The collapsible content is now fully hidden.');
    setCookie('topmenu', 'closed','1');
});

$("#topmenu").on('shown.bs.collapse', function(){
    //alert('The collapsible content is now fully shown.');
    setCookie('topmenu', 'open','1');
});

var check = getCookie('topmenu');
if(check == 'closed'){
  $(".collapse").collapse("hide");
}


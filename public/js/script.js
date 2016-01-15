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


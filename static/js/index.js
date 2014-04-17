$('#signup').click(function(){
  if($(this).hasClass("on"))
  {
    $(".signup-fields").slideUp();
    $(this).removeClass('on').html("sign up");
    $('#submit').attr('value','log in');
    $('#verb').html('continue');
  }
  else
  { 
    $(".signup-fields").slideDown();
    $(this).addClass('on').html("nevermind, log in");
    $('#submit').attr('value','sign up');
    $('#verb').html('begin');
  }
});
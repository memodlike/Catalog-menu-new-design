// Глобальные переменные!!!
var encryptedURL = null;
var ParentTarget = null;

function isLocalStaticMode() {
    return window.location.protocol === 'file:' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
}

function normalizeStaticHomeLinks() {
    if (!isLocalStaticMode()) {
        return;
    }

    var mainPageHref = './%D0%93%D0%BB%D0%B0%D0%B2%D0%BD%D0%B0%D1%8F%20%D1%81%D1%82%D1%80%D0%B0%D0%BD%D0%B8%D1%86%D0%B0.html';
    $('a[href="https://bccinsurance.sinoasia.kz/Home/Index"]').attr('href', mainPageHref);
    $('a[href="https://bccinsurance.sinoasia.kz/Home/Index#"]').attr('href', '#');
}

$(function () {
    normalizeStaticHomeLinks();
});


$('.l-logoff').on('click', function () {
        swal({
            title : "",
            text: "Вы действительно хотите выйти?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#004F91",
            confirmButtonText: "Да",
            closeOnConfirm: false,
            cancelButtonText: "Нет"
        }, function () {
            setTimeout(function () {
                if (isLocalStaticMode()) {
                    window.location.href = './%D0%93%D0%BB%D0%B0%D0%B2%D0%BD%D0%B0%D1%8F%20%D1%81%D1%82%D1%80%D0%B0%D0%BD%D0%B8%D1%86%D0%B0.html';
                    return;
                }
                window.location.href = "/Account/LogOut";
            }, 1500);
            swal({ title: "Всего доброго!", timer: 1500, showConfirmButton: false });
        });
    });

$('#theme-change-sun').on('click', function () {    
    $("#appThemeDarkMode").click();
});


//----------------------------------Обработка форм--------------------
//срабатывает при закрытии страницы для разблокировки записи
function onUnloadFunction() {
    url = "/Forms/CloseBlocks";
    $.get(url, { id: getURLParameter('id'), tableid: getURLParameter('tableid') },
            function (data) {
            });
}

// нужна для управления чекбоксами при групповом удалении / перемещении
function CheckboxChange(e) {
    var unique_field = "[data-unique_field='" + $(e).data('unique_field') + "']";

    if ($(e).attr('class') == 'SelectAll') {
        $(".check" + unique_field).prop("checked", $(e).is(':checked'));
    }
    else {
        if ($("input[class='check']" + unique_field + ":checked").length <= 0) {
            $(".SelectAll" + unique_field).prop({
                indeterminate: false,
                checked: false
            });
            return false;
        }
        $(".SelectAll" + unique_field).prop({
            indeterminate: !($("input[class='check']" + unique_field + ":checked").length == $("input[class='check']" + unique_field).length),
            checked: ($("input[class='table']" + unique_field + ":checked").length == $("input[class='table']" + unique_field).length)
        });
    }
}




 function CreateComplete(message, tabnum)
{
    if (tabnum != undefined)
    {
        $('.close').click();
        $('.btn-close').click();
        ShowTost(message);
        $('[data-tabnum=' + tabnum + ']').trigger('dblclick');
    }
    else
    {
        var action;
        try {
            // понимаем, что нужно передать в функцию InitPage: insert or update
            action = $('.btn-close').parent().parent().find('.btn.btn-primary').data('action');
        }
        catch (e) {
            action = 'error';
        }

        $('.close').click();
        $('.btn-close').click();
        if (message != null && message != "") {

            toastr.clear($toastlast);
            ShowTost(message);
        }
       // try {
            $('.evValidate .evBtnCancel').attr('disabled', 'disabled');
        $('.evValidate .evBtnCancelAll').attr('disabled', 'disabled');
       // location.reload();
        InitPage(action);
      //  } catch (e) {
      //  }
    }
    // ignore the error
}

function NotificationFromCookie(cookieName = "")
{
    var mes = getCookie(cookieName);
    if (mes != undefined && mes != '')
    {
        getNewTost(mes, "warning");
    } 
}

function ValidateOTPCode() {
    $('.votpcodeDiv').hide();
    getNewTost('Код отправлен на телефон!', 'success');
    //$('.votpcodeDiv').show();
}

function CreateSwal(message) {
    swal({
        title: "Проверка КДП",
        text: message,
        html: true,
        customClass: "",
        closeOnEsc: true,
        closeOnClickOutside: true,
        showCancelButton: false
    });
}
function CreateWithRedirect(message, url) {
    $('.close').click();
$('.btn-close').click();
    if (message != null && message != "") {
        getNewTost(message);
    }
    try {
        setTimeout(function () {

          
               // window.open(url, '_blank');
           
                window.location.href = url;
            
        }, 500);
    } catch (e) {
    } // 
}

var elemContinue;

var codeevt = 1;

//Инициализация модальной формы
function InitModals(Func, btnclass) {
    btnclass = btnclass == null ? '' : '.' + btnclass;
    $('.btn-open-modal' + btnclass).off('click');
    $('.btn-open-modal-data' + btnclass).off('click');
    $('.mouseoverbtn').off('click');

    $('.btn-open-modal' + btnclass).on('click', function (e) {

        var el = $(this);
        var noModal = false;
        var noModalMessage = "";
        var addons = "";
        elemContinue = $(this);
     
        var url = (addons.length > 0 ? el.data('modal-url') + addons : el.data('modal-url'));

       

        if ($(this).hasClass('mouseoverbtn')) {
            url += '?tableid=' + $(this).data('tableid') + '&id=' + $(this).data('id');
        }

        var noload = false;
       

        if (!noload) {
            $(el.data('bs-target') + ' .modal-content').html('<div style="margin-top: 40px;"><div class="sk-spinner sk-spinner-three-bounce"><div class="sk-bounce1"></div><div class="sk-bounce2"></div><div class="sk-bounce3"></div></div></div>');
        }

        var str = el.data('titlemsg');
        var title = "";
        if (str != undefined && str != null)
            title = str.replace(/ /ig, '$');

        var btnType = "0";
        if (el.data('buttonstype') != undefined && el.data('buttonstype') != null)
            btnType = el.data('buttonstype');

        var urlAdd = "";
        if (btnType!="0" && el.data('buttonstype') != undefined && el.data('buttonstype') != null )
            urlAdd = '&funcModelType=' + btnType + '&funcTitleMsg=' + title;
       
        
        if (!noload) {
            $(el.data('bs-target') + ' .modal-content').load(
                    url + urlAdd,
                    function () {
                        if (noModal) { close(); getNewTost(noModalMessage, "warning"); }
                        $('#prefieldstext').hide();
                      
                        setSelect2ContainerWidth();
                        setTextAreaContainerWidth();

                        if (Func != null) {
                            $('[data-toggle="tooltip"]').tooltip();
                            Func();
                        }
                             
                        if ($('#hasnolayout').val() == 'true') {
                            $('#result191004 .ladda-button-submit-modal').click();
                        }
                        if ($("#tableid").val() == 250 && $('#field_13327_0_1_1_M_0_1').data('tablename') == 'view_vote') { 
                            $.ajax({
                                url: '/Global/GetSelectDataByIdForPVote',
                                type: 'POST',
                                data: {
                                    ProtocolId: $('input[data-name="id"]').val()
                                },
                                success: function (data) {
                                    const parsed = JSON.parse(data);

                                    $('#field_13328_0_1_1_M_0_1').empty().select2({
                                        data: parsed
                                    });
                                }
                            });
                        }

                        if ($("#tableid").val() == 90) {

                            $('#carInput').val($('input[data-name="mark"]').val() + ' ' + $('input[data-name="model"]').val());
                            $('#yearInput').val($('input[data-name="vyear"]').val());
                            //  $('#yearFrom').val($('input[data-name="vyear"]').val());
                            //    $('#yearTo').val($('input[data-name="vyear"]').val());
                            generateLink();
                            //$('#field_10341_0_1_1_M_0_1').val(generateLink());
                            //$("#field_10341_0_1_1_M_0_1").val(url);
                        }
                      
                    }
                );

        }
        //console.log('.btn-open-modal' + btnclass);
        var mediaQueryList = window.matchMedia('print');
        mediaQueryList.addListener(function (mql) {
            if (mql.matches) {
                alert('onbeforeprint equivalent');
            } else {
                alert('onafterprint equivalent');
            }
        });
        // close();

        //Сбрасываем код eventa, будет работать только для sweetalert!
        codeevt = 1;

    });

    function close() {
        $('.close').click();
        $('.btn-close').click()
    };

    InitLookupEditBtns();

  
    $('.btn-open-modal-data' + btnclass).on('click', function () {
        var el = $(this);
        var arr = [];
        //формируем словарь для значений полей поиска
        $(".auxsrc").each(function () {

            arr.push({
                key: $(this).attr('name'),
                value: $(this).val()
            })
        });

        $(el.data('target') + ' .modal-content').html('<div style="margin-top: 40px;"><div class="sk-spinner sk-spinner-three-bounce"><div class="sk-bounce1"></div><div class="sk-bounce2"></div><div class="sk-bounce3"></div></div></div>');
        /* sealep17082016 Закомментил, так как если в лоаде есть передаваемые данные, то дергается контроллер с атрибутом HttpPost при совпадении имен */
        $(el.data('target') + ' .modal-content').load(el.data('modal-url'), { auxsrc: arr },
           function () {
               setSelect2ContainerWidth();
               if (Func != null) {
                   $('[data-toggle="tooltip"]').tooltip();
                   Func();
               }
           });
    });
}

function OpenInNewTab(url, ParentTarget_) {
    var win = window.open(url, '_blank');
    win.opener = null;
    if (ParentTarget_ != null && ParentTarget_ != undefined) {
        $(win).on('load', function () {
            win.ParentTarget = ParentTarget_;
        });
    }
}

function setSelect2ContainerWidth() {



    $(".select2-container--bootstrap-5").each(function () {
        var $this = $(this),
            inputGroup = $this.parents(".select2width"),
            inputGroupContainerWidth,
            inputGroupAddonWidth = 3;

        if (inputGroup.length) {
            inputGroupContainerWidth = inputGroup.width();//inputGroup.parents("[class^='col-']").width() || inputGroup.parents(".form-group").width();

            $this.parents(".select2width").find(".btn-group").each(function () {
                inputGroupAddonWidth += $(this).outerWidth();
            });

            $this.css({
                width: (inputGroupContainerWidth - inputGroupAddonWidth)
            });
        }
    });
    $(".select2-search__field").each(function () {
        $(this).removeAttr('style');
    });
}

function setTextAreaContainerWidth() {
    $(".CodeMirror").each(function () {
        var $this = $(this),
            inputGroup = $this.parents(".select2width"),
            inputGroupContainerWidth,
            inputGroupAddonWidth = 0;

        if (inputGroup.length) {
            inputGroupContainerWidth = inputGroup.width(); //inputGroup.parents("[class^='col-']").width() || inputGroup.parents(".form-group").width();

            $this.parents(".select2width").find(".btn-group").each(function () {
                inputGroupAddonWidth += $(this).outerWidth();
            });

            $this.css({
                width: (inputGroupContainerWidth - inputGroupAddonWidth)
            });
        }
    });
}

var $toastlast = null;
var errorCount = true;

function getNewTost(text, type, timeout) {
    timeout = (timeout === undefined) ? 5000 : timeout;

    if (text != null && text != "") {
        toastr.options = {
            "closeButton": true,
            "debug": false,
            "newestOnTop": false,
            "progressBar": false,
            "positionClass": "toast-top-right",
            "preventDuplicates": false,
            "onclick": null,
            "showDuration": "300",
            "hideDuration": "1000",
            "timeOut": 0,
            "extendedTimeOut": 0,
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut",
            "tapToDismiss": true
        }

        switch (type) {
            case "success":
                toastr.success(text, '', {
                    timeOut: timeout
                });
                break;
            case "error":
                toastr["error"](text, 'ОШИБКА', {
                    timeOut: 0, tapToDismiss: false
                });
                Ladda.stopAll();
                break;
            case "info":
                toastr.info(text, '', {
                    timeOut: timeout
                });
                break;
            case "warning":
                toastr.clear($toastlast);
                $toastlast = toastr.warning(text, '', {
                    timeOut: 0, tapToDismiss: false
                });
                break;
            case "notification":
                toastr.success(text, '', {
                    timeOut: 0, tapToDismiss: false
                });
                break;

            default:
                toastr.success(text, '', {
                    timeOut: timeout
                });
                break;
        }
    }

    $('.toast-close-button').on('click', function () {
        errorCount = true;
    });
}

function ShowTost(message) {
    if (message != null && message != "") {
        if (message.indexOf('Внимание!') > 0) {
            getNewTost(message,'warning');
    } else   getNewTost(message);
    }
}


function initIChecks(cls, divClass) {
    $(divClass + ' .i-checks').iCheck({
        checkboxClass: 'icheckbox_' + cls,
        radioClass: 'iradio_' + cls,
    });
/*$(divClass + ' .i-checks').each(function(){
    if ($(this).find('input').is(':checked')){
        $(this).iCheck('check');
    } else {
    }

});*/
}



function getURLParameter(name) {
    var url = location.search;
    var route = decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(url) || [, ""])[1].replace(/\+/g, '%20')) || null;
    if (route == null) {
        var w = decodeURIComponent((new RegExp('[?|&]w=' + '([^&;]+?)(&|#|;|$)').exec(url) || [, ""])[1].replace(/\+/g, '%20')) || null;
        if (w != null) {
            if (encryptedURL == null) {
              //  DecryptParams(w);
                encryptedURL = '?' + encryptedURL + '&mnu=' + decodeURIComponent((new RegExp('[?|&]mnu=' + '([^&;]+?)(&|#|;|$)').exec(url) || [, ""])[1].replace(/\+/g, '%20')) || "";
            }
        } else encryptedURL = location.search;

        route = decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(encryptedURL) || [, ""])[1].replace(/\+/g, '%20')) || null;
    }
    return route;
}

function changeUrlParam(param, value) {
    var currentURL = window.location.href + '&';
    if (currentURL.indexOf(param + "=") < 0) {
        var currURL = window.location.href;
        if (currURL.indexOf("?") !== -1) {
            window.history.replaceState('', '', currentURL.slice(0, -1) + '&' + param + '=' + value);
        } else {
            window.history.replaceState('', '', currentURL.slice(0, -1) + '?' + param + '=' + value);
        }
    } else {
        var change = new RegExp('(' + param + ')=(.*?)&', 'g');
        var newURL = currentURL.replace(change, '$1=' + value + '&');
        window.history.replaceState('', '', newURL.slice(0, -1));
    }
}


function getCookie(name) {
    var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}
function setCookie(name, value, options) {
    options = options || {
    };

    var expires = options.expires;

    if (typeof expires == "number" && expires) {
        var d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
    }
    if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
    }

    value = encodeURIComponent(value);

    var updatedCookie = name + "=" + value;

    for (var propName in options) {
        updatedCookie += "; " + propName;
        var propValue = options[propName];
        if (propValue !== true) {
            updatedCookie += "=" + propValue;
        }
    }

    document.cookie = updatedCookie;
}
function deleteCookie(name) {
    setCookie(name, "", {
        expires: -1
    })
}



//-------------------------------------ДЛЯ ЛОГИНА------------------------
var $lastClicked = null;

function DoLoginModal() {
    if (isLocalStaticMode()) {
        return;
    }
    if ($("#globalmodalback").css('display') == 'none') {
     //       $('#content').css('pointer-events', "none");
     //   $('#content').css('opacity', 0.5);
        //$("#toggleLoginModal").click();
            $.ajax({
                url: '/Account/DoLoginModal',
                type: "get",
                success: function (d, t, x) {
                    if (d != "null") {
                        $("#toggleLoginModal").click();

                       /* $("#globalmodal").modal({
                            keyboard: true, backdrop: false,show:true
                        });*/
                        $('#globalmodalback .modal-content').html(d);
                    } else {
                        getNewTost('Ошибка при попытке вывода формы авторизации...', 'error');
                    }
                },
                error: function (a, b, c) {
                    if (b == "timeout") {
                        getNewTost('Истекло время ожидания запроса', 'error');
                    };
                }
            });
        }
}


function DoSubmit(el) {
    if (isLocalStaticMode()) {
        return;
    }
    var data = {};
    getUserIP(function (ip) {
        // alert("Got IP! :" + ip);
        $('#LocalIpAddress').val(ip);
    });
    data.UserName = $('#UserName').val();
    data.Password = $('#Password').val();
    //        data.LocalIpAddress = $('#LocalIpAddress').val();
    $.ajax({
        url: '/Account/LoginModal',
        type: "post",
        data: data,
        success: function (d, t, x) {
            if (d != "null") {
                if (d.indexOf('success')>0) {
                    $('body').off('keyup');
                    //getNewTost('Авторизация прошла успешно!', 'success');
                    $("#globalmodalback").modal("hide");
                  //  $('#content').css('pointer-events', "");
                  //  $('#content').css('opacity', "");
                    try { Scripts_ReinitLadda('.ladda-button'); } catch (e) { }
                    try { ReinitLaddaModal(); } catch (e) { }

                    try {
                        if ($('#modal .modal-content .modal-form-result').length <= 0) {
                            $('#modal').modal("hide");
                        } else {
                            $("body").addClass("modal-open");
                        }
                    } catch (e) { }

                    $('.tblawaiter').addClass('dspn');
                    $('.form-awaiter').css('display', 'none');
                    //    $('.row').css('pointer-events', "");
                    //     $('.row').css('opacity', "");
                    //     try { $lastClicked.click(); } catch (e) { }
                }
                else {
                    //   $('#submitModal').removeClass("processing");
                  //  getNewTost(d, 'error');
                }
                //$('#modal .modal-content').html(d);
            } else {
                getNewTost('Произошел сбой при попытке авторизации...', 'warning');
            }
        },
        error: function (a, b, c) {
            if (b == "timeout") {
                getNewTost('Истекло время ожидания запроса', 'error');
            };
        }
    });

}

$(function () {

    initTgbtn();

    // глобальный перехват всех ответов от сервера на запросы аякса!
    $.ajaxSetup({
        success: function (data) {
        },
        statusCode: {
            401: function () {
                if (!isLocalStaticMode()) {
                    DoLoginModal();
                }
            },
            403: function () {
                if (!isLocalStaticMode()) {
                    DoLoginModal();
                }
            },
            400: function () {
                console.log('Пошла 400');
            }
        }
    });

      $(document).ajaxStop(function (d) {
        $('.row').css('pointer-events', "");
        $('.row').css('opacity', "");
    });

});

function initTgbtn() {
    $('.tg-btn2').off('click');
    $('.tg-btn2').on('click', function () {
        var el = $(this);
        if (!el.hasClass('tgbtn-active')) {
            el.parent().children('.tg-btn1').removeClass('tgbtn-active');
            el.addClass('tgbtn-active');
        }
    });

    $('.tg-btn1').off('click');
    $('.tg-btn1').on('click', function () {
        var el = $(this);
        if (!el.hasClass('tgbtn-active')) {
            el.parent().children('.tg-btn2').removeClass('tgbtn-active');
            el.addClass('tgbtn-active');
        }
    });
}

 

   function Init_pwd() {
        if ($('#passold').length>0){
            $(document).off('input', '#passold');
            $(document).on('input', '#passold', function () {
                $('.btn-change-password').removeAttr('disabled');
                $('#errorlabel').html('');
            });
            $(document).off('input', '#passnew');
            $(document).on('input', '#passnew', function () {
                $('.btn-change-password').removeAttr('disabled');
                $('#errorlabel').html('');
            });
            $(document).off('input', '#passnewdubl');
            $(document).on('input', '#passnewdubl', function () {
                $('.btn-change-password').removeAttr('disabled');
                $('#errorlabel').html('');
            });
            $(document).off('click', '.btn-change-password');
            $(document).on('click', '.btn-change-password', function () {
                $.ajax({
                  type: "POST",
                  url: '/Home/ChangePassword',
                  data: {
                    passold: $('#passold').val(), passnew: $('#passnew').val(), passnewdubl: $('#passnewdubl').val()
                },
                  success: function (res) {
                        if ("" + res === "success") {
                            $('.close').click();
                            $('.btn-close').click();
                            swal("Пароль успешно изменен!", "", "success");
                          //  $('#NeedChangePass').remove();
                        }
                        else {
                            swal("Ошибка!", res, "error")
                  }
                }
                });
            });
        }
}


//-------------------------------------ДЛЯ ЛОГИНА------------------------


//-------------------Высота общего окна------------
function setHeiHeight() {
    $('#page-wrapper').css({
        'min-height': ($(window).height()) + 'px'
    });

   // ActualizeSel2Width();

    setSelect2ContainerWidth();
    setTextAreaContainerWidth();

             

    $('.tab-content').css({
        'height': 'auto'
    });
}

function ActualizeSel2Width(divclass){
       var dclass = divclass==undefined || divclass=='' ? '': divclass+' ';
          $(dclass+'.sel2').each(function (i, v) {
        name = $(v).attr('name');
        ph = $(v).attr('placeholder');
        val1 = $(v).data('val');
        $(v).select2({
theme: 'bootstrap-5',
dropdownParent: $(this).parents('.modal').length > 0 ? $(this).parent().parent() : null ,
//width: '100%',
            placeholder: $(v).data( 'placeholder' )
            ,allowClear: true
        });});     
}

setHeiHeight(); // устанавливаем высоту окна при первой загрузке страницы
//$(window).resize(setHeiHeight()); // обновляем при изменении размеров окна
//-------------------Высота общего окна------------
window.onresize = function () {
    setHeiHeight();
};

$(function () {
    if ($('#CurrentDevices').length > 0) {
        $('#CurrentDevices').val(getCookie("MyDevices"));
       // $('#CurrentDevices').val('123456');
    }
   
});

// глобальная обработка ошибок 
window.onerror = function (msg, url, line, col, error) {
    try {
        // var err = new Error();
        //  alert(error.stack);
        var errstack = "";
        if (error != null) {
            errstack = error.stack;
        }
        $.ajax({
            type: "POST",
            url: "/Global/ClientJSErrorHandler",
            data: {
                note: "Ошибка выполнения клиентского java-скрипта - " + msg, errstack: url + ' Line: ' + line + ' Col: ' + col, errcallstack: errstack
            },
            success: function (d, t, x) {
                if (x.status == 200) {
                    getNewTost(d, "error");
                } else {
                    getNewTost("Ошибка ответа сервера.", "error");
                }
            }
        });
    } catch (e) {
        getNewTost("Ошибка ответа сервера.", "error");
    }
    var suppressErrorAlert = true;
    return suppressErrorAlert;
};
function CheckResponse(status, message) {
    if (status == "error" && message !== "Session timeout") {
        getNewTost(message == "" ? "Неизвестная ошибка!" : message, "error");
    }
}

//разворачиваем основное меню на позицию текущей ветки
var iteration = 5;
function ShowCurrentMenuItem(mainLi) {
    if (mainLi[0].tagName == 'LI') mainLi.addClass("active");
    mainLi.parent().closest("ul").addClass("in");
    mainLi.parent().removeAttr('style');
    mainLi.parent().attr("aria-expanded", "true");
    if ((mainLi.attr("class") + "") != "nav-first-level active") {
        if (iteration == 0) return;
        ShowCurrentMenuItem(mainLi.parent());
    }
    iteration--;
}

$('#side-menu').show();

//--------------------------------------КОМПОНЕНТ ЛУКАП-----------------------
//Переменная для навешивания событий к элементу li
var active = null;
//Родительский класс, который разделяет элементы lookup
var ParentLookUpClass = "";


function InitLookupEditBtns() {
   
    $('.mouseoverbtn').on('click', function () {
        if ($(this).hasClass('mouseoverbtn') && $(this).data('toggle') == '' || $(this).data('toggle') == undefined) {
            OpenInNewTab($(this).data('reditcontroller') + '?id=' + $(this).data('id') + '&tableid=' + $(this).data('tableid')/* + val*/);
            return;
        }
    });
}

//Инициализация lookup
function InitLookup() {

    $('.btn-complete-search-history').off('click');
    $('.btn-complete-search-history').on('click', function () {
        var url = $(this).data('searchcontroller');
        ParentLookUpClass = $(this).parent().parent().parent().attr('class').split(' ')[0];
        $('.' + ParentLookUpClass + ' .searchfields').hide();
        var obj = {
        };
        $('.' + ParentLookUpClass + ' .elementawait').show();
        get_ajax('post', url, obj, SearchRes, ErrorRes);
    });



    //При нажатии на кнопку поиск
    $('.btn-complete-search').off('click');
    $('.btn-complete-search').on('click', function () {
        //Получить родителя
        //alert($(this).parent().attr('class').split(' ')[0]);
        ParentLookUpClass = $(this).parent().parent().parent().attr('class').split(' ')[0];

        var obj = {
        };
        //В searchcontroller нужно объявить метод поиска
        var url = $(this).data('searchcontroller');
       // var lookupfieldid = ParentLookUpClass.indexOf('search') > 0 ? ParentLookUpClass.split('_')[2] : ParentLookUpClass.split('_')[3];

        if ($('.' + ParentLookUpClass + ' input:checked').length > 0) {

            url = url.substring(0, url.indexOf('&searchfieldid')) + '&searchfieldid=' + $('.' + ParentLookUpClass + ' input:checked').data('searchfieldid');
            url += '&isesbd=' + $(this).data('isesbd');
            url += '&auxname=' + $(this).attr('name');
            url += '&localparentid='+$(this).data('localparentid')
        }

        //В Search параметр поика
        var isinit = "" + $('.' + ParentLookUpClass + ' .lookup_search').val().indexOf('[');

        if (isinit < 0) {
            obj.Search = $('.' + ParentLookUpClass + ' .lookup_search').val();
        } else {
            obj.Search = $('.' + ParentLookUpClass + ' .lookup_value').val();
        }
        //Если значение не пусто выполнить AJAX запрос
        if ($('.' + ParentLookUpClass + ' .lookup_search').val() !== "") {
            $('.' + ParentLookUpClass + ' .elementawait').show();
            get_ajax('post', url, obj, SearchRes, ErrorRes, false);
        } else {
            ClearVal();
        }
    });

    //При нажатии на кнопку создать
    $('.insert_button').on('click', function () {

        if ($(this).data('toggle') == '' || $(this).data('toggle') == undefined) {
            ParentLookUpClass = $(this).parent().parent();
            if ($(this).data('rcreatecontroller').length && $(this).data('rcreatecontroller') !== "") {
                OpenInNewTab($(this).data('rcreatecontroller'), ParentLookUpClass);
            }
        }
        else {
            var el = $(this);
            var target = el.data('target');
            var url = el.data('modal-url');

            $(el.data('target') + ' .modal-content').html('<div style="margin-top: 40px;"><div class="sk-spinner sk-spinner-three-bounce"><div class="sk-bounce1"></div><div class="sk-bounce2"></div><div class="sk-bounce3"></div></div></div>');

            $(el.data('target') + ' .modal-content').load(
                el.data('modal-url'), function () {
                    Core_InitValidation('.newValidateModal.t' + el.data('tableid'));
                    $('.newValidateModal.t' + el.data('tableid')).parent().find('.close').on('click', function () {
                        $('.newValidateModal.t' + el.data('tableid')).parent().parent().parent().parent().css('display', 'none');
                    });
                    $('.newValidateModal.t' + el.data('tableid')).parent().find('.btn-close').on('click', function () {
                        $('.newValidateModal.t' + el.data('tableid')).parent().parent().parent().parent().css('display', 'none');
                    });
                    InitLookup();
                    $('.newValidateModal.t' + el.data('tableid')).parent().parent().parent().parent().css('display', 'block');
                    setSelect2ContainerWidth();
                    setTextAreaContainerWidth();
                }
            );
        }
    });

    //При нажатии на кнопку редактировать
    $('.btn.inp-button.edit_button').off('click');
    $('.btn.inp-button.edit_button').on('click', function () {

        ParentLookUpClass = $(this).parent().parent().parent().attr('class').split(' ')[0];
        var val = "" + $('.' + ParentLookUpClass + ' .lookup_value').val();

        if ($(this).data('toggle') == '' || $(this).data('toggle') == undefined) {

            if ($(this).data('reditcontroller').length && $(this).data('reditcontroller') !== "") {

                if (val !== "") {
                    OpenInNewTab($(this).data('reditcontroller') + '?tableid=' + $(this).data('tableid') + '&id=' + (val == "undefined" ? $(this).data('id') : val)/* + val*/);
                }
            }
        }
        else 
        {
            
            if (val != '') {
                var el = $(this);
                var target = el.data('target');

                var url = el.data('modal-url') + '?tableid=' + $(this).data('tableid') + '&id=' + (val == "undefined" ? $(this).data('id') : val) + '&outfieldid=' + ($(this).data('outfieldid') == "undefined" ? '0' : $(this).data('outfieldid'));

                $(el.data('target') + ' .modal-content').html('<div style="margin-top: 40px;"><div class="sk-spinner sk-spinner-three-bounce"><div class="sk-bounce1"></div><div class="sk-bounce2"></div><div class="sk-bounce3"></div></div></div>');


                $(el.data('target') + ' .modal-content').load(
                    url, function () {
                        Core_InitValidation('.newValidateModal.t' + el.data('tableid'));
                        $('.newValidateModal.t' + el.data('tableid')).parent().find('.close').on('click', function () {
                            $('.newValidateModal.t' + el.data('tableid')).parent().parent().parent().parent().css('display', 'none');
                        });
                        $('.newValidateModal.t' + el.data('tableid')).parent().find('.btn-close').on('click', function () {
                            $('.newValidateModal.t' + el.data('tableid')).parent().parent().parent().parent().css('display', 'none');
                        });
                        InitLookup();


                        $('.newValidateModal.t' + el.data('tableid')).parent().parent().parent().parent().css('display', 'block');
                        setSelect2ContainerWidth();
                        setTextAreaContainerWidth();
                    }
                );
            }
            else {
                return;
            };
        }
    });

    $('.group_edit').off('click');
    $('.group_edit').on('click', function () {
        if ($(this).data('reditcontroller').length && $(this).data('reditcontroller') !== "") {
            var val = "" + $(this).val();
            if (val !== "") {
                OpenInNewTab($(this).data('reditcontroller'));
            }
        }
    });

    //При нажатии кнопки ENTER в поле лукапа
    $('.lookup_search').off('keypress');
    $('.lookup_search').on('keypress', function (e) {
        var keyCode = e.keyCode || e.which;

        if (keyCode === 13) {
            ParentLookUpClass = $(this).parent().parent().attr('class').split(' ')[0];

            $(this).data('lookupid', '');
            $(this).data('lookupname', '');
            var obj = {
            };
          //  var lookupfieldid = ParentLookUpClass.indexOf('search') > 0 ? ParentLookUpClass.split('_')[2] : ParentLookUpClass.split('_')[3];
            var url = $('.' + ParentLookUpClass + ' .search_button').data('searchcontroller');

            if ($('.' + ParentLookUpClass + ' input:checked').length > 0) {
                url = url.substring(0, url.indexOf('&searchfieldid')) + '&searchfieldid=' + $('.' + ParentLookUpClass + ' input:checked').data('searchfieldid');
                url += '&isesbd=' + $(this).data('isesbd');
                url += '&auxname=' + $(this).attr('name');
            }
            obj.Search = $(this).val();

            if ($(this).val() !== "") {
                $('.' + ParentLookUpClass + ' .elementawait').show();
                get_ajax('post', url, obj, SearchRes, ErrorRes);
            } else {
                ClearVal();
            }
            return false;
        } else {
            if ($(this).val() === "") {
                ClearSearchRes();
            }
        }
    });

    $('.i-checks').find('label').add('.iCheck-helper').add('.iradio_square-blue.hover').on('click', function () {
        var inputField = $(this).parent().parent().parent().parent().find('.ev-input-group.input-group').find('.lookup_search');

        var radioType = $(this).find('.iradio_square-blue').find('input').data('inputtype');

        var inputType = $(inputField).data('inputtype');
        var fieldVal = inputField.val();
        if (radioType == 'int') {
            if (isNaN(fieldVal) && fieldVal != '') {
                var inputFields = $(this).parent().parent().parent().parent().find('.ev-input-group.input-group').find('input');
                for (i = 0; i < inputFields.length; i++) {
                    inputFields[i].value = '';
                }
                getNewTost('Поле должно содержать только цифры', 'warning');
            }
        }
        else if (radioType == 'varchar' && fieldVal != '') {
            if (!isNaN(fieldVal) && fieldVal != '') {
                var inputFields = $(this).parent().parent().parent().parent().find('.ev-input-group.input-group').find('input');
                for (i = 0; i < inputFields.length; i++) {
                    inputFields[i].value = '';
                }
                getNewTost('Поле должно содержать только текст', 'warning');
            }
        }
    });

    //Пытаемся снова вводить данные
    $('.lookup_search, .auxsrc').off('input');
    $('.lookup_search, .auxsrc').on('input', function () {

        $(this).parent().parent().find('div.evErrorBlock label').text('');
        Core_ClearValidationError($(this).parents('.firstFormDiv'));
        var parentDiv = $(this).parents('.fieldBorderDiv');
        var value = $(this).val();
        if (!$(this).hasClass('auxsrc'))
            ParentLookUpClass = $(this).parent().parent().attr('class').split(' ')[0];
        
        var radioElem = parentDiv.find('.i-checks').find('.lookupsearchfield');
        if (radioElem.length > 0) {
            for (i = 0; i < radioElem.length; i++) {
                if (radioElem[i].checked) {
                    var radioType = $(radioElem[i]).data('inputtype');
                    if ($(this).data('inputtype') != radioType) {
                        $(this).data('inputtype', radioType);
                    }
                }
            }
        }
        var input_type = $(this).data('inputtype');
        var first_entry_data_type = $('.lookupsearchfield').data('inputtype');
        //Присваиваем тип данных если не было клика на выпадающее меню (по умолчанию)
       // if (typeof input_type == 'undefined') {
       //     input_type = first_entry_data_type;
       // }
        //Проверка на ввод числовых значений
        if (input_type == 'int') {
            var n = value.indexOf("]");
            var s = value.indexOf("[");
            var str = value;
            if (s == -1)
                s = 0;

            if (n != -1)
                value = value.substring(s + 1, n);

            if (isNaN(value)) {

                $(this).val('');
                
                if (errorCount) {
                    errorCount = false;
                    return getNewTost('Только цифры!', 'warning');
                }
            } else {
               
                $(this).val(str);
                var idName = $(this).attr('id');
                var pos = idName.lastIndexOf("_LOOKUP");
                var idNameHidden = idName.substring(0, pos);
                var inpHidden = document.getElementById(idNameHidden);
                if (inpHidden != null) {
                    inpHidden.value = value;
                };
                value = str;
                if (value.indexOf('[') >= 0 && value.indexOf(']') > 0) {
                EvaluateVal(value.substr(value.indexOf('[') + 1, value.indexOf(']') - value.indexOf('[') - 1), value.substr(value.indexOf(']') + 2, value.length - value.indexOf(']') - 2), ParentLookUpClass);
                $('.' + ParentLookUpClass + ' .lookup_search').data('isinitialized', '0');
                }
            };

        }
           
        else {
            if (!$(this).hasClass('auxsrc')) {
                if (value!=null && value.indexOf('[') >= 0 && value.indexOf(']') > 0) {
                    EvaluateVal(value.substr(value.indexOf('[') + 1, value.indexOf(']') - value.indexOf('[') - 1), value.substr(value.indexOf(']') + 2, value.length - value.indexOf(']') - 2), ParentLookUpClass);
                    $('.' + ParentLookUpClass + ' .lookup_search').data('isinitialized', '0');
                } else {
           
                    $(this).data('lookupid', '');
                    $(this).data('lookupname', '');
                    var obj = {
                    };
                    var url = $('.' + ParentLookUpClass + ' .search_button').data('searchcontroller');
                   // var lookupfieldid = ParentLookUpClass.indexOf('search') > 0 ? ParentLookUpClass.split('_')[2] : ParentLookUpClass.split('_')[3];

              
                    if ($('.' + ParentLookUpClass + ' input:checked').length > 0) {
                        url = url.substring(0, url.indexOf('&searchfieldid')) + '&searchfieldid=' + $('.' + ParentLookUpClass + ' input:checked').data('searchfieldid');
                    }
                
                    obj.Search = $(this).val();
                    $('.' + ParentLookUpClass + ' .lookup_search').data('isinitialized', '1');
              
                    ClearSearchRes();
                }
            }
        }
    });

    
    $('.lookup_search').focus(function () {
        
        ParentLookUpClass = $(this).parent().parent().attr('class').split(' ')[0];
        $('.' + ParentLookUpClass + ' .searchfields').hide();
        $('.' + ParentLookUpClass + ' .fields_button').data('barison', '0');
        var id = $(this).data('lookupid');
        if (id !== "" && $(this).val() != "" ) {
            $(this).val(id);
        }
        $(this).select();
    });

   
    $('.lookup_search').focusout(function () {
        
        ParentLookUpClass = $(this).parent().parent().attr('class').split(' ')[0];
        
        var id = $(this).data('lookupid');
        var name = $(this).data('lookupname');
        if (id !== "" && name !== "" && $(this).val() == id) {
            $(this).val("[" + id + "] " + name);
        }
        if ($(this).val() == "")
            ClearVal();
    });

   
    $('.expand_button').off('click');
    $('.expand_button').on('click', function () {
        
      
        ParentLookUpClass = $(this).parent().parent().parent().attr('class').split(' ')[0];
        $('.' + ParentLookUpClass + ' .searchfields').hide();

        var ison = "" + $(this).data('lookupison');
        if (ison === "0") {
            if ($('.' + ParentLookUpClass + ' .edit_button').length) $('.' + ParentLookUpClass + ' .edit_button').show();
            if ($('.' + ParentLookUpClass + ' .edit_button').length) $('.' + ParentLookUpClass + ' .edit_button').removeAttr('disabled');
            if ($('.' + ParentLookUpClass + ' .insert_button').length) $('.' + ParentLookUpClass + ' .insert_button').show();
            if ($('.' + ParentLookUpClass + ' .btn-complete-search-history').length) $('.' + ParentLookUpClass + ' .btn-complete-search-history').show();
            $(this).data('lookupison', '1');
            $(this).children('i').removeClass('ti-chevron-left').addClass('ti-chevron-right');
        } else {
            if ($('.' + ParentLookUpClass + ' .edit_button').length) $('.' + ParentLookUpClass + ' .edit_button').hide();
            if ($('.' + ParentLookUpClass + ' .insert_button').length) $('.' + ParentLookUpClass + ' .insert_button').hide();
            if ($('.' + ParentLookUpClass + ' .btn-complete-search-history').length) $('.' + ParentLookUpClass + ' .btn-complete-search-history').hide();
            $(this).data('lookupison', '0');
            $(this).children('i').removeClass('ti-chevron-right').addClass('ti-chevron-left');
        }
    });

   
    $('.fields_button').off('click');
    $('.fields_button').on('click', function () {

        ParentLookUpClass = $(this).parent().parent().parent().attr('class').split(' ')[0];


        var barison = "" + $(this).data('barison');

        if (barison === "0") {

            if ($('.' + ParentLookUpClass + ' .searchfields').length) {

                $('.' + ParentLookUpClass + ' .searchfields').show();
            }
            initIChecks('square-blue','.'+ ParentLookUpClass);
            $(this).data('barison', '1');
        }
        else {

            if ($('.' + ParentLookUpClass + ' .searchfields').length) $('.' + ParentLookUpClass + ' .searchfields').hide();
            $(this).data('barison', '0');
        }
    }
        );
  

}

//Обновить значение
function EvaluateVal(id, name, ParentLookUpClass) {
    $('.' + ParentLookUpClass + ' .lookup_search').val(id).trigger('input');
    $('.' + ParentLookUpClass + ' .lookup_value').val(id).trigger('input');



    //производим влияние на зависимые поля по выборке данных
    Core_DoSelectInfluence($('.' + ParentLookUpClass + ' .lookup_value'), true, false, 'unknown');

    //Производим влияние на значение других полей через трансмутацию по влиянию на значение
    var changeInfl = $('.changeinfluenser.' + $('.' + ParentLookUpClass + ' .lookup_value').attr('id'));

    if (changeInfl.children().length > 0) {
        changeInfl.children().each(function () {
            // элемент на который оказываем влияние
            var changeTMfield = Core_GetTMElementByListDiv($(this));
            Core_DoChangeExternalInfluence(changeTMfield, false, false, 'unknown'); //а видим ли я в зависимости от внешних факторов?
        });
    }

    Core_UpdateFormAsFieldDetails($('.' + ParentLookUpClass + ' .lookup_value'), ParentLookUpClass);

if (id!='') {
    $('.' + ParentLookUpClass + ' .lookup_search').val("[" + id + "] " + name);
}
    $('.' + ParentLookUpClass + ' .lookup_search').data('lookupid', id);
    $('.' + ParentLookUpClass + ' .lookup_search').data('lookupname', name);
    $('.' + ParentLookUpClass + ' .lookup_search').data('isinitialized', '1');
   
}

//Метод замены части строки от между двумя индексами
String.prototype.replaceBetween = function (start, end, toUpdate) {
    return this.substring(0, start) + toUpdate + this.substring(end);
};

//Обнулить значения
function ClearVal() {
    $('.' + ParentLookUpClass + ' .lookup_value').val('');
    $('.' + ParentLookUpClass + ' .lookup_search').data('lookupid', '');
    $('.' + ParentLookUpClass + ' .lookup_search').data('lookupname', '');
    $('.' + ParentLookUpClass + ' .lookup_search').data('isinitialized', '0');
}

//Отчистить результат поиска
function ClearSearchRes() {
    $('.' + ParentLookUpClass + ' .autocomplete').hide();
    $('.' + ParentLookUpClass + ' .search_res').empty();
}

//Активировать события
function ActivateEvent() {
    active = document.querySelector('.' + ParentLookUpClass + ' .search_res li');
    document.addEventListener("keydown", handler);
    document.addEventListener("mouseover", handler);
}

//Деактивировать события
function DeactivateEvent() {
    document.removeEventListener("keydown", handler);
    document.removeEventListener("mouseover", handler);
}

//Функция обработки событий перемещения клавиш курсора
function handler(e) {
    if (active != null) {
        active.classList.remove("hov");
        var keyCode = e.keyCode || e.which;
        if (e.target.className === 'search_li' || e.target.className === 'search_li hov') {
            if (keyCode === 40) {
                active = active.nextElementSibling || active;
            } else if (keyCode === 38) {
                active = active.previousElementSibling || active;
            } else if (keyCode === 13) {
                var id = $(e.target).data('searchid');
                var name = $(e.target).data('searchname');
                EvaluateVal(id, name, ParentLookUpClass);
                ClearSearchRes();
                DeactivateEvent();
                return;
            }
            else {
                active = e.target;
            }
            active.classList.add("hov");
            active.focus();
        }
    }


}

// запоминаем выбор пользователя значения для лукапа в таблицу базы. для формирования истории...
$('body').on('change, input', '.lookup_value', function (e) {
    var data = { };
    data.srctableid = $(this).data('srctableid');
    data.searchfieldid = $(this).data('searchfieldid');
    data.recordid = $(this).val();
    $.ajax({
        type: "POST",
        url: '/Forms/RemeberLookupChoice_',
        data: data,
        success: function (d) {
            Core_HandleStringExceptionError(d)
        }
    });
});

//Если не двигаем курсор, а только кликаем
function sliclick(e) {
    ParentLookUpClass = $(e).parent().parent().parent().parent().attr('class').split(' ')[0];
    var ParentLookUpTableName = $(e).parent().parent().parent().parent().find('.ev-input-group').find('.lookup_value').data('tablename');

   
    var id = $(e).data('searchid');
    var name = $(e).data('searchname');
    
    if (id > 0) {
        EvaluateVal(id, name, ParentLookUpClass);
        ClearSearchRes();
        $('.' + ParentLookUpClass + ' .lookup_search').data('isinitialized', 0);
        DeactivateEvent();
        if ($('.' + ParentLookUpClass + ' .edit_button').length) $('.' + ParentLookUpClass + ' .edit_button').removeAttr('disabled');
        $('')
        

        let m = ParentLookUpClass.split('_');
       

        var el = $('.' + ParentLookUpClass + ' .evInput');
        el.parent().children('.btn-group').children('.evBtnCancel').removeAttr('disabled');
        if (el.data('evoldvall') == el.val()) {
            el.parent().children('.btn-group').children('.evBtnCancel').attr('disabled', true);
        }
        Core_SetUpFormButtons('.newValidate');
        Core_SetUpFormButtons('.newValidateModal');
    } else     ClearSearchRes();
    //else getNewTost("Невозможно указать пустое значение или NULL ", "warning");
}

//Успешный результат запроса по поиску
function SearchRes(res) {
    ClearSearchRes();
    $('.' + ParentLookUpClass + ' .elementawait').hide();
    if (Core_HandleStringExceptionError(res) && res.length > 2) { //>2 так как пустой json массив имеет два символа []

        var json_obj = $.parseJSON(res);

        for (var i in json_obj) {
            var how = i === "0" ? " hov" : "";
            if (json_obj[i] != null)
                if (json_obj[i].text != undefined) {
                    $('.' + ParentLookUpClass + ' .search_res').append("<li class='search_li" + how + "' data-searchid='" + json_obj[i].id + "' data-searchname='" + json_obj[i].text + "' tabindex='" + i + "' onclick='sliclick(this)'>[" + json_obj[i].id + "] " + json_obj[i].text + "</li>");
                }
        }

        if ($('.' + ParentLookUpClass + ' .autocomplete').length) {
            $('.' + ParentLookUpClass + ' .autocomplete').show();
            var ediv = $('.' + ParentLookUpClass + ' .autocomplete').children('div').children('ul').children('li');
           
        }
        //Активировать события
        ActivateEvent();

    }
    else if (res.indexOf('.$.') < 0) {
        getNewTost('Поиск не дал результатов...', 'warning');
      
    }
}

//Если ошибка при поиске
function ErrorRes(a, b, c) {
    $('.' + ParentLookUpClass + ' .elementawait').hide();
    getNewTost('Проблема при обработке AJAX запроса поиска данных'
        , "error");
}

//Выполнить ajax запрос
function get_ajax(type, url, obj, callback, callerror, async) {
    if (async == undefined) async = true;
    $.ajax({
        type: type,
        url: url,
        data: obj,
        async: async,
        success: callback,  //возвратная функция
        error: callerror    //ошибка в функции функция
    });
}

// Отправляет ID добавленной записи в элемент окна, из которого была открыта вкладка добавления новой записи (ДЛЯ ЛУКАПОВ)
function SendValueToParentWindow(id) {
    if (ParentTarget != null && ParentTarget != undefined && id != '' && id != undefined) {
        ParentTarget.find('.lookup_search').val(id);
        ParentTarget.find('.lookup_value').val(id);
        ParentTarget.find('.btn-complete-search').trigger('click');
        try { ParentTarget.parent().parent().find('.search_li').trigger('click'); } catch (e) { };
    }
}
//--------------------------------------КОМПОНЕНТ ЛУКАП-----------------------

$(function () {
//   $('.ladda-button-login').ladda().ladda('stop');
   $('.ladda-button-login').click(function(){

    $('.ladda-button-login').ladda().ladda('start');

});

});

$(function(){
    var isStaticMode = isLocalStaticMode();
    var SMART_MENU_SECTION_DEFAULT_IDS = ['33', '1202', '13', '29'];
    var SMART_MENU_SECTION_TITLE_ALLOWLIST = {
        'Личный кабинет': true,
        'Мои документы': true,
        'Договоры': true,
        'Документы': true
    };
    var SMART_MENU_STORAGE_KEY = 'mainMenu.smartSections.v1';
    var MENU_ANIMATION_MS = 140;
    var smartMenuSectionIds = SMART_MENU_SECTION_DEFAULT_IDS.slice();
    var dragContext = {
        sectionId: null,
        itemId: null
    };
    var smartSectionShowAllState = {};

    function resolveSmartMenuSectionIds() {
        var resolved = [];

        $('#mainmenu > .menu-item.has-sub').each(function () {
            var $section = $(this);
            var sectionId = String($section.attr('data-elementid') || '');
            var sectionTitle = $.trim(String($section.attr('title') || $section.children('.menu-link').find('> .menu-text').text() || ''));

            if (!sectionId) {
                return;
            }
            if (SMART_MENU_SECTION_TITLE_ALLOWLIST[sectionTitle] || SMART_MENU_SECTION_DEFAULT_IDS.indexOf(sectionId) !== -1) {
                if (resolved.indexOf(sectionId) === -1) {
                    resolved.push(sectionId);
                }
            }
        });

        SMART_MENU_SECTION_DEFAULT_IDS.forEach(function (sectionId) {
            if (resolved.indexOf(sectionId) === -1) {
                resolved.push(sectionId);
            }
        });

        smartMenuSectionIds = resolved.slice(0, 4);
    }

    function isSmartMenuSection(sectionId) {
        return smartMenuSectionIds.indexOf(String(sectionId)) !== -1;
    }

    function normalizeSectionState(sectionState) {
        if (!sectionState || typeof sectionState !== 'object') {
            sectionState = {};
        }
        if (!Array.isArray(sectionState.pinned)) {
            sectionState.pinned = [];
        }
        if (!Array.isArray(sectionState.order)) {
            sectionState.order = [];
        }
        if (typeof sectionState.openFirstId !== 'string') {
            sectionState.openFirstId = '';
        }
        sectionState.pinned = sectionState.pinned.map(function (id) { return String(id); })
            .filter(function (id, index, arr) { return id && arr.indexOf(id) === index; });
        sectionState.order = sectionState.order.map(function (id) { return String(id); })
            .filter(function (id, index, arr) { return id && arr.indexOf(id) === index; });
        if (sectionState.openFirstId && sectionState.order.indexOf(sectionState.openFirstId) === -1) {
            sectionState.openFirstId = sectionState.order.length ? sectionState.order[0] : '';
        }
        return sectionState;
    }

    function getSmartMenuState() {
        var raw = null;
        var state = {};
        try {
            raw = localStorage.getItem(SMART_MENU_STORAGE_KEY);
            state = raw ? JSON.parse(raw) : {};
        } catch (e) {
            state = {};
        }
        if (!state || typeof state !== 'object') {
            state = {};
        }
        return state;
    }

    function saveSmartMenuState(state) {
        try {
            localStorage.setItem(SMART_MENU_STORAGE_KEY, JSON.stringify(state || {}));
        } catch (e) { }
    }

    function getSectionStateWithRoot(sectionId) {
        var sectionKey = String(sectionId);
        var rootState = getSmartMenuState();
        rootState[sectionKey] = normalizeSectionState(rootState[sectionKey]);
        return {
            rootState: rootState,
            sectionState: rootState[sectionKey],
            sectionKey: sectionKey
        };
    }

    function syncMainMenuHeaderToggle() {
        var isMinified = $('#app').hasClass('app-sidebar-minified');
        var $toggle = $('#mainmenu > .menu-header .menu-header-toggle');
        if (!$toggle.length) {
            return;
        }

        var iconClass = isMinified ? 'ti ti-chevrons-right' : 'ti ti-chevrons-left';
        var actionLabel = isMinified ? 'Развернуть меню' : 'Свернуть меню';

        $toggle.attr('aria-label', actionLabel);
        $toggle.attr('title', actionLabel);
        $toggle.attr('aria-expanded', isMinified ? 'false' : 'true');
        $toggle.toggleClass('is-minified', isMinified);
        $toggle.find('> i').attr('class', iconClass);
    }

    function ensureMainMenuHeader() {
        var $mainMenu = $('#mainmenu');
        if (!$mainMenu.length) {
            return;
        }

        var $header = $mainMenu.children('.menu-header').first();
        if (!$header.length) {
            $header = $('<div class="menu-header"></div>');
            $mainMenu.prepend($header);
        }

        $header
            .addClass('menu-header-row')
            .empty()
            .append('<span class="menu-header-title">МЕНЮ</span>')
            .append('<button type="button" class="menu-header-toggle" aria-label="Свернуть меню" title="Свернуть меню" aria-expanded="true"><i class="ti ti-chevrons-left"></i></button>');

        syncMainMenuHeaderToggle();
    }

    function ensureSidebarNativeScroll() {
        var $sidebarContent = $('.app-sidebar .app-sidebar-content');
        if (!$sidebarContent.length) {
            return;
        }

        var $wrapper = $sidebarContent.parent('.slimScrollDiv');
        if ($wrapper.length) {
            $wrapper.before($sidebarContent);
            $wrapper.remove();
        }

        $sidebarContent.css({
            'overflow-y': 'auto',
            'overflow-x': 'hidden',
            'height': 'calc(100vh - 3.75rem)'
        });
    }

    function collapseMainMenuForMinified() {
        var $mainMenu = $('#mainmenu');
        if (!$mainMenu.length) {
            return;
        }
        $mainMenu.find('.menu-item.has-sub').removeClass('expand');
        $mainMenu.find('.menu-submenu').stop(true, true).hide();
        $('.app-float-submenu').remove();
    }

    function toggleSidebarMinifiedState() {
        var $app = $('#app');
        var targetClass = 'app-sidebar-minified';
        var isMinified = $app.hasClass(targetClass);

        if (isMinified) {
            $app.removeClass(targetClass);
            try {
                localStorage.removeItem('appSidebarMinified');
            } catch (e) { }
        } else {
            $app.addClass(targetClass);
            try {
                localStorage.setItem('appSidebarMinified', true);
            } catch (e) { }
        }

        syncMainMenuMinifiedState();
    }

    function syncMainMenuMinifiedState() {
        if ($('#app').hasClass('app-sidebar-minified')) {
            collapseMainMenuForMinified();
        }
        syncMainMenuHeaderToggle();
    }

    function bindSidebarMinifySync() {
        $(document)
            .off('click.mainMenuHeaderToggle', '#mainmenu > .menu-header .menu-header-toggle')
            .on('click.mainMenuHeaderToggle', '#mainmenu > .menu-header .menu-header-toggle', function (e) {
                e.preventDefault();
                toggleSidebarMinifiedState();
            })
            .off('click.mainMenuMinifySync', '[data-toggle="sidebar-minify"]')
            .on('click.mainMenuMinifySync', '[data-toggle="sidebar-minify"]', function () {
                if ($(this).hasClass('menu-header-toggle')) {
                    return;
                }
                window.setTimeout(function () {
                    syncMainMenuMinifiedState();
                }, 0);
            });
    }

    function setSmartSectionShowAll(sectionId, isEnabled) {
        smartSectionShowAllState[String(sectionId)] = !!isEnabled;
    }

    function getSmartSectionShowAll(sectionId) {
        return !!smartSectionShowAllState[String(sectionId)];
    }

    function resetSmartSectionShowAll(sectionId) {
        setSmartSectionShowAll(sectionId, false);
    }

    function menuItemHasActivity($item) {
        var hasActivity = false;
        $item.find('.menu-icon-label').each(function () {
            var value = parseInt($.trim($(this).text()), 10);
            if (!isNaN(value) && value > 0) {
                hasActivity = true;
                return false;
            }
            return true;
        });
        return hasActivity;
    }

    function menuItemIsCurrent($item) {
        var currentMnu = String(getURLParameter('mnu') || '');
        if (!currentMnu || currentMnu === '0') {
            return false;
        }
        if (String($item.attr('data-elementid') || '') === currentMnu) {
            return true;
        }
        return $item.find('.menu-link[data-elementid="' + currentMnu + '"]').length > 0;
    }

    function ensurePinButton($item) {
        var $link = $item.children('.menu-link');
        if (!$link.length || $link.find('> .menu-pin-btn').length > 0) {
            return;
        }
        var $pinButton = $('<button type="button" class="menu-pin-btn" title="Закрепить пункт" aria-label="Закрепить пункт" aria-pressed="false"><i class="ti ti-pin"></i></button>');
        var $caret = $link.children('.menu-caret').first();
        if ($caret.length > 0) {
            $caret.before($pinButton);
        } else {
            $link.append($pinButton);
        }
    }

    function persistSectionOrder(sectionId) {
        if (!isSmartMenuSection(sectionId)) {
            return;
        }
        var stateBundle = getSectionStateWithRoot(sectionId);
        var $items = $('#mainmenu > .menu-item[data-elementid="' + stateBundle.sectionKey + '"] > .menu-submenu > .menu-item');
        var order = [];

        $items.each(function () {
            var itemId = String($(this).attr('data-elementid') || '');
            if (itemId) {
                order.push(itemId);
            }
        });

        stateBundle.sectionState.order = order;
        stateBundle.sectionState.openFirstId = order.length ? order[0] : '';
        stateBundle.rootState[stateBundle.sectionKey] = stateBundle.sectionState;
        saveSmartMenuState(stateBundle.rootState);
    }

    function renderSmartMenuSection(sectionId) {
        if (!isSmartMenuSection(sectionId)) {
            return;
        }

        var stateBundle = getSectionStateWithRoot(sectionId);
        var sectionKey = stateBundle.sectionKey;
        var sectionState = stateBundle.sectionState;
        var isShowAll = getSmartSectionShowAll(sectionKey);
        var $section = $('#mainmenu > .menu-item[data-elementid="' + sectionKey + '"]');
        var $submenu = $section.children('.menu-submenu');

        if (!$section.length || !$submenu.length) {
            return;
        }

        var $items = $submenu.children('.menu-item');
        if (!$items.length) {
            return;
        }

        var itemIndex = {};
        var orderedIds = [];
        $items.each(function () {
            var itemId = String($(this).attr('data-elementid') || '');
            if (!itemId) {
                return;
            }
            itemIndex[itemId] = $(this);
            $(this).addClass('menu-smart-draggable').attr('draggable', true);
            ensurePinButton($(this));
        });

        sectionState.order.forEach(function (itemId) {
            if (itemIndex[itemId]) {
                $submenu.append(itemIndex[itemId]);
                orderedIds.push(itemId);
                delete itemIndex[itemId];
            }
        });

        Object.keys(itemIndex).forEach(function (itemId) {
            $submenu.append(itemIndex[itemId]);
            orderedIds.push(itemId);
        });

        sectionState.order = orderedIds;
        if (!sectionState.openFirstId && orderedIds.length) {
            sectionState.openFirstId = orderedIds[0];
        }
        if (sectionState.openFirstId && orderedIds.indexOf(sectionState.openFirstId) === -1) {
            sectionState.openFirstId = orderedIds.length ? orderedIds[0] : '';
        }

        var pinnedIndex = {};
        sectionState.pinned.forEach(function (itemId) {
            pinnedIndex[String(itemId)] = true;
        });

        var hiddenCount = 0;
        $submenu.children('.menu-item').each(function () {
            var $item = $(this);
            var itemId = String($item.attr('data-elementid') || '');
            if (!itemId) {
                return;
            }

            var isPinned = !!pinnedIndex[itemId];
            var hasActivity = menuItemHasActivity($item);
            var isCurrent = menuItemIsCurrent($item);
            var isPreferredFirst = sectionState.openFirstId && itemId === sectionState.openFirstId;
            var shouldShow = isShowAll || hasActivity || isPinned || isCurrent || isPreferredFirst;

            $item.toggleClass('menu-smart-hidden', !shouldShow);
            if (!shouldShow) {
                hiddenCount++;
            }

            var $pinButton = $item.children('.menu-link').find('> .menu-pin-btn');
            $pinButton.toggleClass('is-pinned', isPinned);
            $pinButton.attr('aria-pressed', isPinned ? 'true' : 'false');
            $pinButton.attr('title', isPinned ? 'Открепить пункт' : 'Закрепить пункт');
            $pinButton.attr('aria-label', isPinned ? 'Открепить пункт' : 'Закрепить пункт');
        });

        $submenu.children('.menu-item').removeClass('menu-smart-first');
        var $preferredFirst = sectionState.openFirstId ? $submenu.children('.menu-item[data-elementid="' + sectionState.openFirstId + '"]:not(.menu-smart-hidden)').first() : $();
        if (!$preferredFirst.length) {
            $preferredFirst = $submenu.children('.menu-item:not(.menu-smart-hidden)').first();
        }
        if ($preferredFirst.length) {
            var firstVisibleId = String($preferredFirst.attr('data-elementid') || '');
            if (firstVisibleId && sectionState.openFirstId !== firstVisibleId) {
                sectionState.openFirstId = firstVisibleId;
            }
            $preferredFirst.addClass('menu-smart-first');
        }

        var $toggleRow = $submenu.children('.menu-smart-toggle-row');
        if (!$toggleRow.length) {
            $toggleRow = $('<div class="menu-smart-toggle-row"><button type="button" class="menu-smart-toggle-btn"></button></div>');
            $submenu.append($toggleRow);
        }
        $submenu.append($toggleRow);

        var $toggleButton = $toggleRow.find('.menu-smart-toggle-btn');
        $toggleButton.attr('data-sectionid', sectionKey);
        if (isShowAll || hiddenCount > 0) {
            if (isShowAll) {
                $toggleButton.text('Скрыть неактивные');
            } else {
                $toggleButton.text('Показать все (' + hiddenCount + ')');
            }
            $toggleRow.show();
        } else {
            $toggleRow.hide();
        }

        stateBundle.rootState[sectionKey] = sectionState;
        saveSmartMenuState(stateBundle.rootState);
    }

    function ensureFirstSmartItemOpened(sectionId) {
        if (!isSmartMenuSection(sectionId) || $('#app').hasClass('app-sidebar-minified')) {
            return;
        }

        var stateBundle = getSectionStateWithRoot(sectionId);
        var $section = $('#mainmenu > .menu-item[data-elementid="' + stateBundle.sectionKey + '"]');
        if (!$section.length || !$section.hasClass('expand')) {
            return;
        }

        var $submenu = $section.children('.menu-submenu');
        if (!$submenu.length) {
            return;
        }

        var preferredId = String(stateBundle.sectionState.openFirstId || stateBundle.sectionState.order[0] || '');
        var $targetItem = preferredId ? $submenu.children('.menu-item[data-elementid="' + preferredId + '"]:not(.menu-smart-hidden)').first() : $();
        if (!$targetItem.length) {
            $targetItem = $submenu.children('.menu-item:not(.menu-smart-hidden)').first();
        }
        if (!$targetItem.length) {
            return;
        }

        var targetId = String($targetItem.attr('data-elementid') || '');
        if (targetId && stateBundle.sectionState.openFirstId !== targetId) {
            stateBundle.sectionState.openFirstId = targetId;
            stateBundle.rootState[stateBundle.sectionKey] = stateBundle.sectionState;
            saveSmartMenuState(stateBundle.rootState);
        }

        if ($targetItem.hasClass('has-sub')) {
            var $nestedSubmenu = $targetItem.children('.menu-submenu');
            if ($nestedSubmenu.length && !$nestedSubmenu.is(':visible')) {
                $targetItem.addClass('expand');
                $nestedSubmenu.stop(true, true).slideDown(MENU_ANIMATION_MS);
            }
        }
    }

    function bindSmartMenuEvents() {
        $(document)
            .off('mouseenter.mainMenuSmartShowAllReset', '#mainmenu > .menu-item.has-sub')
            .on('mouseenter.mainMenuSmartShowAllReset', '#mainmenu > .menu-item.has-sub', function () {
                if (!$('#app').hasClass('app-sidebar-minified')) {
                    return;
                }

                var sectionId = String($(this).attr('data-elementid') || '');
                if (!isSmartMenuSection(sectionId) || !getSmartSectionShowAll(sectionId)) {
                    return;
                }

                resetSmartSectionShowAll(sectionId);
                renderSmartMenuSection(sectionId);
            });

        $(document)
            .off('click.mainMenuSmartPin', '#mainmenu .menu-pin-btn, .app-float-submenu .menu-pin-btn')
            .on('click.mainMenuSmartPin', '#mainmenu .menu-pin-btn, .app-float-submenu .menu-pin-btn', function (e) {
                e.preventDefault();
                e.stopPropagation();

                var $item = $(this).closest('.menu-item');
                var sectionId = String($(this).closest('[data-sectionid]').attr('data-sectionid') || '');
                if (!sectionId) {
                    sectionId = String($item.closest('.menu-submenu').attr('data-parentid') || '');
                }
                if (!sectionId) {
                    var $section = $item.closest('#mainmenu > .menu-item');
                    sectionId = String($section.attr('data-elementid') || '');
                }
                var itemId = String($item.attr('data-elementid') || '');

                if (!isSmartMenuSection(sectionId) || !itemId) {
                    return;
                }

                var stateBundle = getSectionStateWithRoot(sectionId);
                var pinned = stateBundle.sectionState.pinned;
                var itemIndex = pinned.indexOf(itemId);

                if (itemIndex === -1) {
                    pinned.push(itemId);
                } else {
                    pinned.splice(itemIndex, 1);
                }

                stateBundle.sectionState.pinned = pinned;
                stateBundle.rootState[stateBundle.sectionKey] = stateBundle.sectionState;
                saveSmartMenuState(stateBundle.rootState);
                renderSmartMenuSection(sectionId);
            });

        $(document)
            .off('click.mainMenuSmartToggle', '#mainmenu .menu-smart-toggle-btn, .app-float-submenu .menu-smart-toggle-btn')
            .on('click.mainMenuSmartToggle', '#mainmenu .menu-smart-toggle-btn, .app-float-submenu .menu-smart-toggle-btn', function (e) {
                e.preventDefault();
                e.stopPropagation();

                var sectionId = String($(this).attr('data-sectionid') || '');
                if (!isSmartMenuSection(sectionId)) {
                    return;
                }

                var $section = $('#mainmenu > .menu-item[data-elementid="' + sectionId + '"]');
                var $submenu = $section.children('.menu-submenu');
                var hiddenBefore = {};
                $submenu.children('.menu-item.menu-smart-hidden').each(function () {
                    var itemId = String($(this).attr('data-elementid') || '');
                    if (itemId) {
                        hiddenBefore[itemId] = true;
                    }
                });

                setSmartSectionShowAll(sectionId, !getSmartSectionShowAll(sectionId));
                renderSmartMenuSection(sectionId);

                $submenu.children('.menu-item').each(function () {
                    var $item = $(this);
                    var itemId = String($item.attr('data-elementid') || '');
                    if (!itemId || $item.hasClass('menu-smart-hidden') || !hiddenBefore[itemId]) {
                        return;
                    }
                    $item.removeClass('menu-smart-animate-in');
                    void $item[0].offsetWidth;
                    $item.addClass('menu-smart-animate-in');
                });

                if ($(this).closest('.app-float-submenu').length) {
                    var $floatMenu = $(this).closest('.app-float-submenu');
                    var $sourceSubmenu = $('#mainmenu > .menu-item[data-elementid="' + sectionId + '"] > .menu-submenu').first();
                    if ($sourceSubmenu.length && $floatMenu.length) {
                        var $floatSubmenu = $floatMenu.is('.menu-submenu') ? $floatMenu : $floatMenu.find('.menu-submenu').first();
                        if ($floatSubmenu.length) {
                            $floatSubmenu.html($sourceSubmenu.html());
                        } else {
                            $floatMenu.html($sourceSubmenu.html());
                        }
                    }
                }
            });

        $(document)
            .off('dragstart.mainMenuSmartSort', '#mainmenu > .menu-item > .menu-submenu > .menu-item.menu-smart-draggable')
            .on('dragstart.mainMenuSmartSort', '#mainmenu > .menu-item > .menu-submenu > .menu-item.menu-smart-draggable', function (e) {
                var $item = $(this);
                var $section = $item.closest('#mainmenu > .menu-item');
                var sectionId = String($section.attr('data-elementid') || '');
                var itemId = String($item.attr('data-elementid') || '');

                if (!isSmartMenuSection(sectionId) || !itemId) {
                    return;
                }

                dragContext.sectionId = sectionId;
                dragContext.itemId = itemId;
                $item.addClass('menu-smart-dragging');

                if (e.originalEvent && e.originalEvent.dataTransfer) {
                    e.originalEvent.dataTransfer.effectAllowed = 'move';
                    try {
                        e.originalEvent.dataTransfer.setData('text/plain', itemId);
                    } catch (err) { }
                }
            });

        $(document)
            .off('dragover.mainMenuSmartSort', '#mainmenu > .menu-item > .menu-submenu > .menu-item.menu-smart-draggable')
            .on('dragover.mainMenuSmartSort', '#mainmenu > .menu-item > .menu-submenu > .menu-item.menu-smart-draggable', function (e) {
                if (!dragContext.itemId || !dragContext.sectionId) {
                    return;
                }

                var $target = $(this);
                var targetSectionId = String($target.closest('#mainmenu > .menu-item').attr('data-elementid') || '');
                if (targetSectionId !== dragContext.sectionId) {
                    return;
                }

                var targetItemId = String($target.attr('data-elementid') || '');
                if (!targetItemId || targetItemId === dragContext.itemId) {
                    return;
                }

                e.preventDefault();
                var $submenu = $target.parent();
                var $dragItem = $submenu.children('.menu-item[data-elementid="' + dragContext.itemId + '"]');
                if (!$dragItem.length) {
                    return;
                }

                var box = this.getBoundingClientRect();
                var shouldPlaceAfter = (e.originalEvent.clientY - box.top) > (box.height / 2);

                if (shouldPlaceAfter) {
                    $target.after($dragItem);
                } else {
                    $target.before($dragItem);
                }
            });

        $(document)
            .off('drop.mainMenuSmartSort', '#mainmenu > .menu-item > .menu-submenu')
            .on('drop.mainMenuSmartSort', '#mainmenu > .menu-item > .menu-submenu', function (e) {
                if (!dragContext.itemId || !dragContext.sectionId) {
                    return;
                }

                var sectionId = String($(this).closest('#mainmenu > .menu-item').attr('data-elementid') || '');
                if (sectionId !== dragContext.sectionId) {
                    return;
                }

                e.preventDefault();
                persistSectionOrder(sectionId);
                renderSmartMenuSection(sectionId);
                ensureFirstSmartItemOpened(sectionId);
            });

        $(document)
            .off('dragend.mainMenuSmartSort', '#mainmenu > .menu-item > .menu-submenu > .menu-item.menu-smart-draggable')
            .on('dragend.mainMenuSmartSort', '#mainmenu > .menu-item > .menu-submenu > .menu-item.menu-smart-draggable', function () {
                var sectionId = dragContext.sectionId;
                $('.menu-smart-dragging').removeClass('menu-smart-dragging');

                if (sectionId) {
                    persistSectionOrder(sectionId);
                    renderSmartMenuSection(sectionId);
                    ensureFirstSmartItemOpened(sectionId);
                }

                dragContext.sectionId = null;
                dragContext.itemId = null;
            });
    }

    function initSmartMainMenuSections() {
        smartSectionShowAllState = {};
        resolveSmartMenuSectionIds();
        ensureMainMenuHeader();
        ensureSidebarNativeScroll();
        bindSidebarMinifySync();
        syncMainMenuMinifiedState();
        $(window)
            .off('resize.mainMenuNativeScroll')
            .on('resize.mainMenuNativeScroll', function () {
                ensureSidebarNativeScroll();
                if (!$('#app').hasClass('app-sidebar-minified')) {
                    $('.app-float-submenu').remove();
                }
            });
        bindSmartMenuEvents();
        smartMenuSectionIds.forEach(function (sectionId) {
            renderSmartMenuSection(sectionId);
            ensureFirstSmartItemOpened(sectionId);
        });
    }

    function initMainMenuFallback() {
        $(document)
            .off('click.mainMenuFallback', '#mainmenu .menu-item.has-sub > .menu-link')
            .on('click.mainMenuFallback', '#mainmenu .menu-item.has-sub > .menu-link', function(e) {
                var target = $(this).next('.menu-submenu');
                var targetElm = $(this).closest('.menu-item');
                var openState = !target.is(':visible');
                var siblingMenus = targetElm.siblings('.menu-item.has-sub');

                if (!target.length) {
                    return;
                }

                var targetSectionId = String(targetElm.attr('data-elementid') || '');
                if (isSmartMenuSection(targetSectionId)) {
                    resetSmartSectionShowAll(targetSectionId);
                }

                e.preventDefault();

                if ($('.app-sidebar-minified').length !== 0) {
                    return;
                }

                siblingMenus.removeClass('expand');
                siblingMenus.children('.menu-submenu:visible').stop(true, false).slideUp(MENU_ANIMATION_MS);

                target.stop(true, false).slideToggle(MENU_ANIMATION_MS);
                targetElm.toggleClass('expand', openState);

                if (isSmartMenuSection(targetSectionId)) {
                    renderSmartMenuSection(targetSectionId);
                    if (openState) {
                        ensureFirstSmartItemOpened(targetSectionId);
                    }
                }
            });
    }

    function onMainMenuReady() {
        initMainMenuFallback();

        if ($('#NeedChangePass').length > 0) {
            InitModals(Init_pwd);
            $('a.menu-link[data-elementid=23]')[0].click();
        }
        $('#loggedusername').text($('#loggedusername_source').val());

        if ($('#side-menu').length>0){
            $('#side-menu').metisMenu();
            if ((getURLParameter("mnu") > 0) && ($('[data-elementid="' + getURLParameter("mnu") + '"]').length > 0)) {
                ShowCurrentMenuItem($('[data-elementid="' + getURLParameter("mnu") + '"]'));
            }
            $('#side-menu').show();
        }
     /*   let mainMenu = document.querySelector('#side-menu');
        let topMenu = document.querySelector('#page-wrapper > div.row.border-bottom > nav > ul');
        if (topMenu != null) {
            let menuItems = topMenu.querySelectorAll('li[data-topElementId]');
            for (var i = 0; i < menuItems.length; i++) {
                let id = menuItems[i].dataset.topelementid;
                let countSpan = mainMenu.querySelector(`li[data-elementid='${id}'] > a > span.count`)
                if (countSpan === null) continue;
                let count = countSpan.textContent;
                menuItems[i].querySelector('span.count').textContent = count;
            }
        }        */

        InitModals(Init_pwd);
        try{
            InitModals(Core_AfterModalRender);
        } catch (Exception) { };

        if (!isStaticMode) {
            $.ajax(
                {
                    url: '/Global/GetPersonCabInfo',
                    async: false,
                    type: 'get',
                    data: {}
                }).done(function (data) {
                    if (data != "") {
                        var obj = JSON.parse(data);

                        var dict = {};
                        for (var i = 0; i < obj.menuitems.length; i++) {
                            var menuid = obj.menuitems[i].menuid;
                            var menuSpan = $('.menu span[data-menuid=' + menuid + ']');
                            menuSpan.text(obj.menuitems[i].count);
                            //проносим значение дочернего меню в родителей
                            var parentMenuSpan = $('.menu span[data-menuid=' + menuSpan.data('parentid') + ']');
                            if (parentMenuSpan.length > 0) {
                                parentMenuSpan.text((parentMenuSpan.text() * 1) + obj.menuitems[i].count * 1);
                                dict[menuSpan.data('parentid')] = menuSpan.data('parentid');
                            }
                        }
                        for (var key in dict) {
                            var value = dict[key];
                            var parentMenuSpan = $('.menu span[data-menuid=' + value + ']');
                            var parentParentMenuSpan = $('.menu span[data-menuid=' + parentMenuSpan.data('parentid') + ']');
                            if (parentParentMenuSpan.length > 0) {
                                parentParentMenuSpan.text((parentParentMenuSpan.text() * 1) + parentMenuSpan.text() * 1);
                            }
                        }
                    }
                });
        }

        $('.menu-icon-label').each(function () {
            if ($(this).text() == '0') {
                $(this).hide();
            }
        });
        if (getURLParameter("mnu") > 0) {
            var curA = $('.menu a[data-elementid="' + getURLParameter("mnu") + '"]');
            ShowCurrentMenuItem($('.menu a[data-elementid="' + curA.data('parentid') + '"]'));
        }
        initSmartMainMenuSections();
    }

    if ($('#mainmenu').length > 0) {
        if (!isStaticMode) {
            $.get('/Files/GetUserImage', {}, function (data1) {
                if (data1.value != "") {
                    $('#user-image').html(data1.value);
                }
            });

            $.get('/Global/GetMainMenu', {},
                function(data){
                    $('#mainmenu').replaceWith('<div id="mainmenu">' + data + '</div>');
                    onMainMenuReady();
                }
            ).fail(function() {
                onMainMenuReady();
            });
        } else {
            onMainMenuReady();
        }
    }
});

//разворачиваем основное меню на позицию текущей ветки
function ShowCurrentMenuItem(menulink) {
    if (menulink.length > 0) {
       
        menulink.click();
        setTimeout(function () { ShowCurrentMenuItem($('.menu a[data-elementid="' + menulink.data("parentid") + '"]')); }, 300);  
    }
}

function SetEDSPrint() {
    InitNCALayer();
    setTimeout(
        function () {
            if (webSocket.readyState === 1) {
                var selectedStorage = 'PKCS12';
                $("#CMSReady").val('0');
                blockScreen();
                getKeyInfo(selectedStorage, "getKeyInfoBack");
            } else if (webSocket.readyState === 0) {
                SetEDSPrint();
            }
        }, 300);
}

function cashrefresh() {
    if ($('[data-elementid=18]').length > 0) {
        $.ajax({
            type: "POST",
            url: '/Global/CacheReset',
            data: {},
            success: function (res) {
                if (res === "success") {
                    swal("Кеш успешно сброшен!", "", "success");
                }
            }
        });
    }
}           

function InitTreeElementDel(parentdiv) {
    //console.log('parentdiv - ' + parentdiv + ' ol - ' + ol + ' parentid - ' + parentid + ' grandparentid - ' + grandparentid + ' p_param - ' + p_param + ' prennttableid - ' + prennttableid + ' grandparenttableid - ' +grandparenttableid);
    if (typeof parentdiv !== "undefined") {
        parentdiv += " ";
    } else parentdiv = "";

    $('.del-row').off('click');
    $('.del-row').on('click', function (e) {
        var el = $(this);
        e.preventDefault();
        var data = el.data();
        swal({
            title: "Вы уверены?", text: "Вы не сможете восстановить запись после удаления!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#004F91",
            confirmButtonText: "Да, удалить запись!",
            closeOnConfirm: false,
            cancelButtonText: "Отмена!"
        }, function () {
            $.ajax({
                type: "POST",
                url: data.url,
                data: data,
                success: function (d, t, x) {
                    if (Core_HandleStringExceptionError(d)) { // если всё хорошо, то передаётся 1
                        swal("Запись удалена!", "", "success");
                        var li = el.parent().parent().parent().parent().parent().parent();
                        if (li.parent().children('li').length == 1) {
                            li.parent().hide();
                        } else li.hide();

                    }
                }
            });
        });
    });
}

function InitTableAsFieldDel() {

    if (typeof parentdiv !== "undefined") {
        parentdiv += " ";
    } else parentdiv = "";

    $(parentdiv + ".del-row-tableasfield").off('click');
    $(parentdiv + ".del-row-tableasfield").on('click', function (e) {
        var el = $(this);
        e.preventDefault();
        var data = el.data();

        swal({
            title: "Вы уверены?",
            text: "Вы не сможете восстановить запись после удаления!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#004F91",
            confirmButtonText: "Да, удалить запись!",
            closeOnConfirm: false,
            cancelButtonText: "Отмена!",
            allowOutsideClick: true,
            confirmButtonClass: 'ladda-button'
        },
            function () {


                var def = $("#TABLEASFIELD_" + data.tableid + "_" + data.dimid + "_" + data.parentlinkid);
                def.val(def.val().replace(data.id));
                el.parent().parent().parent().parent().parent().hide();
                swal("Запись удалена!", "", "success");
                $(".evBtnUpdateAll").removeAttr('disabled');
            });


    });

    $(parentdiv + ".bulk-delete-tableasfield").off('click');

    $(parentdiv + ".bulk-delete-tableasfield").on('click', function (e) {
        var el = $(this);
        var data = el.data();



        swal({
            title: "Вы уверены?",
            text: "Вы не сможете восстановить запись после удаления!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#004F91",
            confirmButtonText: "Да, удалить запись!",
            closeOnConfirm: false,
            cancelButtonText: "Отмена!",
            allowOutsideClick: true,
            confirmButtonClass: 'ladda-button'
        },
            function () {



                var tablediv = el.parents(".tableasfield-" + data.tableid + "-" + data.dimid + "-0-" + data.parentlinkid);
                var def = $("#TABLEASFIELD_" + data.tableid + "_" + data.dimid + "_" + data.parentlinkid);
                tablediv.find("input[class='check']:checkbox:checked").each(function () {
                    var el = $(this).parent().parent().parent();
                    def.val(def.val().replace(el.data('rowid')));
                    el.hide();
                });

                swal("Запись удалена!", "", "success");
            });


        // эта канитель нужна, чтобы понять, пытаемся ли мы удалить группу записей одним махом, 
        // и если да - формируем массив id записей и заполняем соответствующие переменные

        var searchIDs = $("input[class='check']:checkbox:checked").map(function () {
            return $(this).data('recordid');
        }).get();
        if (searchIDs.length > 0 && el.hasClass('bulk-delete-tableasfield')) {
            el.data("elements2delete", searchIDs);
            data = el.data();
        }

        if (searchIDs.length <= 0 && el.hasClass('bulk-delete')) {
            getNewTost("Вы не отметили ни одной записи для удаления.", "warning");
            return false;
        }
    });

}


function InitLocalDel(postfunction) {
    // функция InitDel с этим параметром нигде не вызывалась...
    if (typeof parentdiv !== "undefined") {
        parentdiv += " ";
    } else parentdiv = "";


    $(parentdiv + ".del-row, .bulk-delete").off('click');
    $(parentdiv + ".del-row, .bulk-delete").on('click', function (e) {
        var el = $(this);
        e.preventDefault();
        var data = el.data();
        // эта канитель нужна, чтобы понять, пытаемся ли мы удалить группу записей одним махом, 
        // и если да - формируем массив id записей и заполняем соответствующие переменные
        var unique_field = "[data-unique_field='" + data.tableid + "-" + data.dimid + "-" + data.parentfieldid + "']";

        var searchIDs = $("input[class='check']" + unique_field + ":checkbox:checked").map(function () {
            return $(this).data('recordid');
        }).get(); // <----
        if (searchIDs.length > 0 && el.hasClass('bulk-delete')) {
            el.data("elements2delete", searchIDs);
            data = el.data();
        }
        if (searchIDs.length <= 0 && el.hasClass('bulk-delete')) {
            getNewTost("Вы не отметили ни одной записи для удаления.", "warning");
            return false;
        }
        ////////////////////////////////////////////////////////////////////////////////////////
        swal({
            title: "Вы уверены?",
            text: "Вы не сможете восстановить запись после удаления!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#004F91",
            confirmButtonText: "Да, удалить запись!",
            closeOnConfirm: false,
            cancelButtonText: "Отмена!",
            allowOutsideClick: true,
            confirmButtonClass: 'ladda-button'
        },
            function () {

                $('.la-ball-fall').remove();
                $('.confirm').ladda().ladda('start');

                $.ajax({
                    type: "POST",
                    url: data.url,
                    data: data,
                    success: function (d, t, x) {
                        if (d > 0) { // если всё хорошо, то передаётся 1
                            $('.confirm').ladda().ladda('stop');
                            swal("Запись удалена!", "", "success");
                            if (postfunction == "InitPage")
                                InitPage('delete');
                            if (postfunction == "CompleteUpdateLocalTable") {
                                CompleteUpdateLocalTable('', data.tableid, data.parentfieldid, data.pvisfldvalue, data.dimid, data.parentlinkid);
                            }
                        } else {
                            $('.confirm').ladda().ladda('stop');
                            swal("Стоп!", d.replace('.$.', ''), "warning");
                        }
                    }
                });
            });
    });





}




//--------------------------------------АНДЕРРАЙТИНГ--------------------------

function Scripts_ShowUnderSwalBox(title, mes, functype, tableid, dimensionid, id, position, absoluteid) {
    swal({
        title: title,
        text: mes,
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#004F91",
        confirmButtonText: "Продолжить!",
        closeOnConfirm: false,
        cancelButtonText: "Отмена!",
        allowOutsideClick: true,
        confirmButtonClass: 'ladda-button'
    },
            function () {

                $('.la-ball-fall').remove();
                $('.confirm').ladda().ladda('start');

                $.ajax({
                    type: "POST",
                    url: "Document/DoAction?funcname=DoActivateNoUnderCheck",
                    data: { functype: functype, tableid: tableid, dimensionid: dimensionid, id: id, position: position, absoluteid: absoluteid, DONOTUNDERCHECK: -1 },
                    success: function (d, t, x) {
                        $('.confirm').ladda().ladda('stop');
                        if (d.indexOf('id') >= 0) getNewTost(d, 'error')
                        else {
                          
                            swal("Договор отправлен на андеррайтинг", "", "success");
                            InitPage();
                          
                        }
                    }
                });
            });
}

function UpdateNotify(id) {
    $(".totalcount").each(function () {
        $(this)[0].innerText = parseInt($(this)[0].innerText, 10) + 1;
    });

    $('.' + id)[0].innerText = parseInt($('.' + id)[0].innerText, 10) + 1;
}

document.addEventListener('click', function (e) {
    var otpbtn = e.target;
    if (otpbtn.matches('button[data-functype="72"]')) {
        var otpdiv = otpbtn.dataset.tableid;
        $('#votpcodeDiv_' + otpdiv).show();
    }
});

function BeginValidateOTP() {
    var inputcode = $('input.votpcode');
    var errorspan = $('span.votpcode');
    inputcode.removeAttr("style");
    errorspan.css("display", "none");        
    return true;
}

function ValidateOTPError() {
    var inputcode = $('input.votpcode');
    var errorspan = $('span.votpcode');
    inputcode.css({ "border-color": "#dc3545", "box-shadow": "0 0 0 0.25rem rgba(220, 53, 69, 0.25)" });
    errorspan.css("display", "block");
}

function OnValidateOTP(result) {
   // e val(result);
}

function CompleteValidateOTP(result) {
    var otpbtn = $('button#submitOTP');
    otpbtn.removeAttr('disabled');
    otpbtn.removeAttr('data-loading');
}


$(function () {
   

        /**
    * Get the user IP throught the webkitRTCPeerConnection
    * @param onNewIP {Function} listener function to expose the IP locally
    * @return undefined
    */
        function getUserIP(onNewIP) { //  onNewIp - your listener function for new IPs
            //compatibility for firefox and chrome
            var myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
            var pc = new myPeerConnection({
                iceServers: []
            }),
                noop = function () { },
                localIPs = {},
                ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g,
                key;

            function iterateIP(ip) {
                if (!localIPs[ip]) onNewIP(ip);
                localIPs[ip] = true;
            }

            //create a bogus data channel
            pc.createDataChannel("");

            // create offer and set local description
            pc.createOffer().then(function (sdp) {
                sdp.sdp.split('\n').forEach(function (line) {
                    if (line.indexOf('candidate') < 0) return;
                    line.match(ipRegex).forEach(iterateIP);
                });

                pc.setLocalDescription(sdp, noop, noop);
            }).catch(function (reason) {
                // An error occurred, so handle the failure to connect
            });

            //listen for candidate events
            pc.onicecandidate = function (ice) {
                if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) return;
                ice.candidate.candidate.match(ipRegex).forEach(iterateIP);
            };
        }

        // Usage

   // getUserIP(function (ip) {
      //  console.log("Got IP! :" + ip);
          //  alert("Got IP! :" + ip);
            // $('#LocalIpAddress').val(ip);
      //  });






    
});



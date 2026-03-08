//Общая функция старта валидации формы, имеющей класс параметра divClass
function Core_InitValidation(divClass) {

    if (divClass == ".newValidateModal") currentValue = 0;
    //  Core_InitIChecks(divClass);
    Core_InitSelect2(divClass);
    Core_InitVisiblesAndTMs(divClass);
    Core_InitDPickers(divClass);
    Core_InitCancelButtons(divClass);
    Core_InitInputs(divClass);
    Core_SetUpFormButtons(divClass);
    Core_InitMoneyTypeInput();
    if (divClass != ".newValidateModal") {


        $('[data-fieldid="336"]').focus(); //app_main policydate
        $('[data-fieldid="1026"]').focus(); //pay_claims actno
    }
    
}


//Инициализация полей поисковой формы
function InitFilters(searchformid) {
    var formfilter = '';
    if (searchformid != undefined) {
        formfilter = '[data-searchformid=' + searchformid + ']';
    }

    $(formfilter + '.filter').find('.dtpicker').datetimepicker({
        lang: 'ru',
        format: 'd.m.Y H:i',
        timepicker: true,
        closeOnDateSelect: true
    });

    $(formfilter + '.filter').find(' .evCheckBox').on('click', function () {
        var el = $(this);
        if (el.is(":checked")) {
            el.val(el.data('valtrue'));
        }
        else {
            el.removeAttr('checked');
            el.val(el.data('valfalse'));
        }
    });

    $(formfilter + '.filter').find('.evCheckBox').each(function () {
        var el = $(this);
        if (el.data('evoldvall') == -1) {
            el.click();
            el.val(el.data('valtrue'));
        }
    })

    $(formfilter + '.filter').find('.dpicker').datetimepicker({
        lang: 'ru',
        format: 'd.m.Y',
        timepicker: false,
        closeOnDateSelect: true
    });
    var name;
    var val;

    $(formfilter + '.filter .sel2').on('change', function () {
        var el = $(this);
        var name = el.attr('name');
        var val = $(this).val();

        if (!(el.val() === '' || el.val() == null)) {
            Core_DoSelectInfluence($(this), true, false, '');
        }

        var tableid = $('#truetableid').val();
        if (tableid != "") { val = tableid; }
    });

    $(formfilter + '.filter .sel2').on('select2:open', function () {
        var el = $(this);
        var arr = $('[aria-controls="select2-' + el.attr('id') + '-results"]');
        arr.get(0).focus();
    });

    $(formfilter + '.filter .sel2').each(function (i, v) {
        name = $(v).attr('name');
        ph = $(v).attr('placeholder');
        val1 = $(v).data('val');
        $(v).select2({
            theme: 'bootstrap-5',
            dropdownParent: $(this).parents('.modal').length > 0 ? $(this).parent().parent() : null,
            //width: '100%',
            placeholder: $(this).data('placeholder')
            , allowClear: true
        });

        if (!$(v).hasClass('dimfield')) {
            val = getURLParameter($(v).attr('name'));
        } else val = val1;

        if (val != null && val != '') {
            $(v).val($(v).data('val') != null ? $(v).data('val').toString().split(',') : null).trigger("change");
            var sf = $(this).parents('.form-searchfields');
            if ($(v).hasClass('dimfield') && $('.dimensionid[data-searchformid=' + sf.data('searchformid') + ']').val() <= 1) {

                Scripts_ReloadSearchForm(val, ph, null, sf.data('searchformid'));
                Core_DoSelectInfluence($(this), true, false, '');
            }
        } else {
            $(v).val('').trigger("change"); //для поправки бага выставления первого значения в групповом селекте

            $(v).val($(v).data('val') != null ? $(v).data('val').toString().split(',') : null).trigger("change"); //выставляем значение по умолчанию


        }

    });

    $(formfilter + '.filter .sel2').on("select2:select", function (e) {
        var val = $(this).val();
        var tableId = $(".formtableid").val();
        var fieldId = $(this).data("fieldid");

        if ($(this).hasClass('dimfield')) {
            var sf = $(this).parents('.form-searchfields');
            Scripts_ReloadSearchForm(val, null, $(this), sf.data('searchformid'));
        }
        //выравниваем ширину
        setSelect2ContainerWidth();
        setTextAreaContainerWidth();
    });

    setSelect2ContainerWidth();
    setTextAreaContainerWidth();
    //  Core_InitIChecks(formfilter + '.filter');

    var IdField = $('[data-name="id"][data-inputtype="int"]');

    IdField.focusout(function () {
        if ($("#GetRecordById").length > 0) {
            var recordid = document.querySelectorAll('[data-name="id"][data-inputtype="int"]')[0].value;
            var tablename = IdField.data("tablename");
            var menuid = $("#GetRecordById").data("menuid");
            $.ajax(
                {
                    url: '/Global/GetLinkToRecord',
                    async: false,
                    type: 'get',
                    data: { recordid: recordid, tablename: tablename, menuid: menuid }
                }).done(function (data) {
                    if (data != "") {
                        $("#GetRecordById")[0].setAttribute("href", data);
                        $("#GetRecordById").show();
                    }
                });
        }
    });

}

function Scripts_MyDateFormat(date) {
    return ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '.' + ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '.' + date.getFullYear()
}

//Инициализация поисковой формы
function Scripts_InitSearchForm(searchformid) {

    InitFilters(searchformid);
    InitLookup(searchformid);
    Scripts_ReinitLadda('.ladda-button-search');


    //для таблиц личного кабинета выводим результат сразу
    if ($('#nosearchform').val()=="1") {
        InitPage();
    }

    var formfilter = '';
    if (searchformid != undefined) {
        formfilter = '[data-searchformid=' + searchformid + ']';
    }

    $(formfilter + '.go-search').on('click', function (e) {
        e.preventDefault();
        InitPage('search', $(this));
    });


    $('.go-showall-search').off('click');
    $('.go-showall-search').on('click', function (e) {
        e.preventDefault();
        $('.ladda-button-search-block').ladda().ladda('start');
        InitPage($(this));
    });


    $('.go-last10-search').off('click');
    $('.go-last10-search').on('click', function (e) {
        e.preventDefault();
        $('.ladda-button-search-block').ladda().ladda('start');
        InitPage($(this));
    });


    $('.go-10added-search').off('click');
    $('.go-10added-search').on('click', function (e) {
        e.preventDefault();
        $('.ladda-button-search-block').ladda().ladda('start');
        InitPage($(this));
    });

    $('.go-my-approvals').off('click');
    $('.go-my-approvals').on('click', function (e) {
        e.preventDefault();
        $('.ladda-button-search-block').ladda().ladda('start');
        InitPage($(this));
    });

    $('.go-get-search').off('click');
    $('.go-get-search').on('click', function (e) {
        e.preventDefault();
        $('.ladda-button-search-block').ladda().ladda('start');
        var model = {};
        model.tableid = getURLParameter("tableid");
        model.dimid = $(this).data('dimid');
        $.ajax({
            url: "/Forms/GetSearchConditions_",
            type: "post",
            data: model,
            timeout: 50000,
            dataType: "text",
            success: function (d, t, x) {

                if (Core_HandleStringExceptionError(d)) {
                    var values = d.split(';');
                    if (values[0].split('=')[0] == "dimid" && values[0].split('=')[1] > 0) {
                        if ($('[data-name="dimid"]').length > 0) {
                            $('[data-name="dimid"]').val(values[0].split('=')[1]);
                            Scripts_ReloadSearchForm(values[0].split('=')[1]);
                        }
                    }
                    for (var i = 0; i < values.length; i++) {
                        if ($('#' + values[i].split('=')[0]).length > 0) {
                            if ($('#' + values[i].split('=')[0]).attr('class').indexOf('auxsrc form-control selectP') >= 0) {
                                if (values[i].split('=')[1] != "") {
                                    $('#' + values[i].split('=')[0]).val(values[i].split('=')[1]).trigger("change");
                                    $('#' + values[i].split('=')[0]).data('val', values[i].split('=')[1]);
                                }
                            }
                            if ($('#' + values[i].split('=')[0]).attr('class').indexOf('lookup_value inp auxsrc') >= 0 && values[i].split('=')[1] != '') {
                                $('#' + values[i].split('=')[0] + '_LOOKUP').val(values[i].split('=')[1]);
                                $('#' + values[i].split('=')[0]).val(values[i].split('=')[1]);
                                $('#' + values[i].split('=')[0]).parent().parent().find(".i-checks[data-name='id']").find("input").trigger('click');
                                var el = $('.f_lookup_' + values[i].split('=')[0].split('_')[1] + '_search');
                                $('#div_' + values[i].split('=')[0]).find('.btn-complete-search').trigger('click');
                                try { $('#' + values[i].split('=')[0]).parent().parent().find('.search_li').trigger('click'); } catch (e) { };

                            } else {
                                $('#' + values[i].split('=')[0]).val(values[i].split('=')[1]);
                            }
                        }
                    }

                }

                getNewTost('Восстановлены критерии последнего поиска.');


                $('.ladda-button-search-block').ladda().ladda('stop');
            },
            error: function (a, b, c) {
                if (b == "timeout") {
                    getNewTost('Истекло время ожидания запроса', 'error');
                    $('.ladda-button-search-block').ladda().ladda('stop');
                };
            }
        });
    });


    InitModals(Core_AfterModalRender);
}



function Core_InitInputs(divClass) {
    $(divClass + ' .evInput').on('input', function () {
        var el = $(this);
        if (el.is(':visible') || el.hasClass('codeTextarea') || el.hasClass('myTextarea')) {
            el.parent().children('.btn-group').children('.evBtnCancel').removeAttr('disabled');
            if (el.data('evoldvall') == el.val()) {
                el.parent().children('.btn-group').children('.evBtnCancel').attr('disabled', true);
            }
        }

      //  $(this).parent().parent().find('div.evErrorBlock label').text('');
        Core_ClearValidationError($(this).parents('.firstFormDiv'));
        Core_DoWizardFieldEcho(el);

        Core_SetUpFormButtons(divClass);
    });

    $(divClass + ' .evCheckBox').on('click', function () {
        var el = $(this);
        if (el.is(":checked")) {
            el.val(el.data('valtrue'));
        }
        else {
            el.removeAttr('checked');
            el.val(el.data('valfalse'));
        }
        Core_SetUpFormButtons(divClass);
    });

    $('.evInput').on('keyup', function () {

        var el = $(this);

        if (el.val() == el.data("evoldvall") || (el.val() == null && el.data("evoldvall") == "")) {
            //el.parent().children('.btn-group').children('.evBtnCancel').attr('disabled', true);
            el.parent().find('.evBtnCancel').attr('disabled', true);
        } else {
            el.parent().find('.evBtnCancel').removeAttr('disabled');
            //el.parent().children('.btn-group').children('.evBtnCancel').removeAttr('disabled');
        }

        Core_SetUpFormButtons(divClass);
    });

    $(".moneyFormat").each(function () {
        MoneyFormat($(this).attr('id'),false);
         if (divClass != ".newValidateModal") {


        //     $('[data-fieldid="336"]').focus(); //app_main policydate
        $('[data-fieldid="1026"]').focus(); //pay_claims actno
         }
    });

    $(divClass + ' .codeTextarea').each(function(){
        var textArea = $(this);
        try {
            textArea.parent('.firstDivElement').find('.CodeMirror').remove();
            editor = null;
            editor = CodeMirror.fromTextArea(textArea.get(0), {//document.getElementById(textArea.attr('name')), {
                mode: 'text/x-pgsql',
                autoRefresh: true,
                indentWithTabs: true,
                lineWrapping: true,
                smartIndent: true,
                lineNumbers: true,
                matchBrackets: true,
                autofocus: true,
                extraKeys: { "Ctrl-Space": "autocomplete" }
            });
            var width = textArea.parent().parent().width();
            $(editor.getScrollerElement()).width(width);
            editor.refresh();
            editor.on("change", function (cm) {
                var valo = cm.getValue();
                textArea.val(valo).trigger('input');
            });
            textArea.on("change", function () {
                editor.getDoc().setValue($(this).val());
            });
        }
        catch (e) {

        }
    });

}

// Обнуляет значения полей, которые скрываются из-за видимостей
function Core_ClearValues(el) {
    if (el.find('.form-control.selectP').length > 0) {
        el.find('.form-control.selectP').val('').trigger('change');
    }

    if (el.find(':checkbox').length > 0 && el.find(':checkbox').val() == -1) {
        el.find(':checkbox').click();
    }
    el.find(':input').val('');
}

function Core_RestoreDefaultValues(el) {
    if (el.find('.form-control.selectP').length > 0) {
        el.find('.form-control.selectP').val(el.find('.form-control.selectP').data('evoldvall')).trigger('change');
    }

    if (el.find(':checkbox').length > 0 && el.find(':checkbox').data('evoldvall') == -1 && el.find(':checkbox').attr('checked') != 'checked') {
        el.find(':checkbox').click();
    }

    if (el.find(':input').data('evoldvall') != undefined && el.find(':input').val() != el.find(':input').data('evoldvall')) {
        el.find(':input').val(el.find(':input').data('evoldvall'));
    }
    el.find(".evBtnCancel:enabled").attr('disabled', true);
}

//Активирует кнопки отмены значения, как единичные, так и массовую
function Core_InitCancelButtons(divClass) {
    
    $(divClass + " .evBtnCancel").each(function () {
        var el = $(this);
    })

    $(divClass + " .evBtnCancel").on("click", function () {
        var el = $(this);
 
        var errlabel = el.parents('.firstFormDiv').find('.field-validation-error');

        $('[name="' + el.data('auxfieldid') + '"]')
            .filter('[value="' + $('[name="' + el.data('auxfieldid') + '"]').data('evoldvall') + '"]')
            .iCheck('check');
        $('#' + el.data('auxfieldid')).val($('#' + el.data('auxfieldid')).data('evoldvall')).trigger('change');
        $('#' + el.data('auxfieldid') + "_view").val($('#' + el.data('auxfieldid')).data('evoldvall')).trigger('change');
        MoneyFormat(el.data('auxfieldid') + "_view",true);
        $('#' + el.data('auxfieldid') + '_LOOKUP').val($('#' + el.data('auxfieldid') + '_LOOKUP').data('evoldvall')).trigger('change');
        errlabel.text('');
        Core_ClearValidationError($(this).parents('.firstFormDiv'));
        el.attr('disabled', true);
        Core_SetUpFormButtons(divClass);
    });

    $(divClass + " .evBtnCancelAll").on("click", function () {
        $(divClass + " .evBtnCancel:enabled").click();
    });
}

//функция проверки произошедших изменений на форме
function Core_CheckChanges(divClass) {
    var changed = false;
    if ($(divClass).find(".evBtnCancel:enabled").length > 0) {
        changed = true;
    }
    var x = document.getElementById("field_206799_206789_1_1_57");
    if (x != null) {
        proId = x.value;
        changed = true;
    }
    else {
        proId = "";
    }

    $(divClass + " .evInput[data-evoldvall='']").add(divClass + " .sel2[data-evoldvall='']").each(function () {
        if ($(this).attr('id').indexOf('auxsrclocal') < 0) {
            if ($(this).val() != '' && $(this).val() != null && $(this).is(':visible')) changed = true;
        }
    })

    $(divClass + " .checkbox-control").each(function () {
        if ($(this).data('evoldvall') != $(this).val()) {
            changed = true;
        };
    });

    $(divClass + " .evCheckBox").each(function () {
        if ($(this).data('evoldvall') != $(this).val()) {
            if (!($(this).data('evoldvall') == '' && $(this).val() == '0'))
                changed = true;
        };
    });

    return changed;
}

//установка активности кнопок формы
function Core_SetUpFormButtons(divClass) {

    var dclass = '.newValidate';
    $('.modal.inmodal').each(function () {
        if ($(this).css('display') != 'none') {
            dclass = '.newValidateModal';
        }
    });

    if (divClass.indexOf('Validate') > 0) dclass = divClass;

    if (Core_CheckChanges(dclass)) {
        $(dclass + " .evBtnCancelAll").removeAttr('disabled');
        $(dclass + " .evBtnUpdateAll").removeAttr('disabled');

        var x = document.getElementById("field_197323_204755_1_1_0");
        if (x != null) {
            proId = x.value;
        }
        else {
            proId = "";
        }
        if (proId == "111865") {
            $('.btn-open-modal').css('display', 'none');
        }
        if ($(dclass + " .evBtnUpdateAll").length > 0) //чтобы исключить случай, когда все доп кнопки не активны, а активны не видимые кнопки
            $(dclass + " .tree-extension-btn").attr('disabled', true); //функциональные кнопки неактивны, если форма изменялась

    } else {
        $(dclass + ' .evBtnCancelAll').attr('disabled', true);
        $(dclass + ' [data-action="insert"]').removeAttr('disabled'); //кнопка "Добавить" всегда активна
        $(dclass + ' [data-action="update"]').attr('disabled', true);
        $(dclass + " .tree-extension-btn").removeAttr('disabled');
    }
    var editButtons = $('.btn.inp-button.edit_button');
    if (editButtons.length > 0) {
        var editField;
        var editValue;
        var editUrl
        for (i = 0; i < editButtons.length; i++) {
            if ($(editButtons[i]).data('toggle') == 'modal') {
                editField = $(editButtons[i]).parent().parent().find('input')[0];


                editValue = $(editField).val();
            }
            else {
                editField = $(editButtons[i]).parent().parent().find('input')[0];
                editValue = $(editField).val();
            }
            if (editValue == '' || editValue == undefined) {
                $(editButtons[i]).attr('disabled', true);
            }

            else if ($(editButtons[i]).attr('disabled') != undefined || $(editButtons[i]).attr('disabled') == true) {
                $(editButtons[i]).removeAttr('disabled');
            }
        }
    }

        var x = document.getElementById("field_12621_0_1_1_0_1");
        if (x != null) {
            sentto1C = x.value;
        }
        else {
            sentto1C = "";
        }
        if (sentto1C == "1") {
            $('button[data-functype="38"]').attr('disabled', true);
        }
    
}

//инициализируем поля с датой
function Core_InitDPickers(divClass) {
    $(divClass).find('.dtpicker').datetimepicker({
        lang: 'ru',
        format: 'd.m.Y H:i',
        timepicker: true,
        dayOfWeekStart: 1,
        closeOnDateSelect: true,
        scrollInput: false
    });

    $(divClass).find('.dpicker').datetimepicker({
        lang: 'ru',
        format: 'd.m.Y',
        timepicker: false,
        dayOfWeekStart: 1,
        closeOnDateSelect: true,
        scrollInput: false
    });

    $(divClass + ' .evDateTimePicker').datetimepicker({
        onSelectDate: function (ct, el) {

            el.parent().children('.btn-group').children('.evBtnCancel').removeAttr('disabled');
            if (el.data('evoldvall') == el.val()) {
                el.parent().children('.btn-group').children('.evBtnCancel').attr('disabled', true);
            }

             Core_ClearValidationError(el.parents('.firstFormDiv'));

            Core_SetUpFormButtons(divClass);
        },
        onChangeDateTime: function (dp, $input) {



        }

    });
    $(divClass).find('.dpicker').on('keyup', function () {

        DateFormat($(this));
    })

    $(divClass + ' .evDateTimePicker').focus(function () {
        $(this).select();
    });

    $(divClass + ' .evDateTimePicker').on('mousewheel', function () {
        $(this).trigger('input');
    });

}


function Core_DoVisibleWithVirtualFieldsRecursivly(e, isShow) {
    var virtualTMs = $('.virtualTMs.' + e.attr('id'));
    if (virtualTMs.children().length > 0) {
        virtualTMs.children().each(function () {
            var virtualfield = Core_GetInflElementByListDiv($(this));
            var par = Core_FindParentByClass(virtualfield, 'fieldBorderDiv');
            if (par != null) {
                if (isShow) par.show(); else par.hide();
                Core_DoVisibleWithVirtualFieldsRecursivly(virtualfield, isShow);
            }
        });
    }
}


function Core_CompareValueWithCondition(inflfield, tmfield, currentdiv) {

    var conditionvalue = currentdiv.data('value1');
    var comparetypeid = currentdiv.data('comparetypeid');
    ishidden = tmfield.data('ishidden');
    if (ishidden == 0) {
        var b = conditionvalue.toString();
        if (b == "") b = "           ";
        var a = b.split(',');

        var l_isShow = false;
        if (tmfield != null) {


            var inflfieldValue = inflfield.val() == null || inflfield.val() == "" ? "           " : inflfield.val();
            //==
            if (comparetypeid == 1 || comparetypeid == 3) { // == IN
                if (a.indexOf(inflfieldValue) >= 0) l_isShow = true;
            }
            //!=
            if (comparetypeid == 2 || comparetypeid == 4) { // != NOT IN
                if (a.indexOf(inflfieldValue) < 0) l_isShow = true;
            }

        }
        return l_isShow;
    }
}

function Core_DoVisibleExternalInfluence(e, divClass) {
    if (e.attr('id') != '' && e.attr('id') != undefined) {
        var newDivClass = (divClass.indexOf('odal') > 0 || divClass.indexOf('able') > 0 ? divClass + ' ' : ''); //если источник модалка, то действуем только в рамках модалки. иначе на всё.
        var visibleTMs = $(newDivClass + '.visibleTMs.' + e.attr('id'));
        if (visibleTMs.children().length > 0) {

            var par = null;
            var ishidden = 1;
            var isShow = true;
            visibleTMs.children().each(function () {
                var inflfield = Core_GetInflElementByListDiv($(this));
                if (inflfield.length > 0) {
                    par = $(newDivClass + '.fieldBorderDiv.div_' + e.attr('id') + ($('#wizard').length > 0 ? '[data-ishidden=0]' : ''));//Core_FindParentByClass(e, 'fieldBorderDiv');
                    if (par.data('fortableasfield')==1) par.data('ishidden',0);

                    ishidden = par.data('ishidden');
                    isShow = isShow && Core_CompareValueWithCondition(inflfield, par, $(this));
                }
            });

            if (ishidden == 0 && par != null) {
                par.each(function () { //для мастеров поля с одинаковым айди могут быть несколько раз на форме, но скрыть нужно только те у которых есть тег с классом visibleTMs
                    if ($(this).find('.visibleTMs.' + e.attr('id')).length > 0) {
                        if ($(this).data('fortableasfield')!=1){
                                if (isShow) { $(this).show(); Core_RestoreDefaultValues($(this)); }
                                else {
                                    $(this).hide(); Core_ClearValues($(this));
                           
                                }
                        } else {
                            if ($(this).find('input').length>0){
                                //подготовка к скрытию таблицы как поля
                                var l_input = $(this).find('input');
                                var tablearr = l_input.data('name').split('_');
                                var tableid = 0;
                                if (tablearr.length==2) tableid = tablearr[1];
                                var absoluteidarr =  $(this).attr('id').split('_');
                                var absoluteid = 1;
                                if (absoluteidarr.length == 8)  absoluteid = absoluteidarr[7];
                                var targetdiv = $('.tableasfield_firstdiv[data-tableid='+tableid+'][data-absoluteid='+absoluteid+']');
                                if (targetdiv.length>0)
                                {
                                    if (isShow) targetdiv.show(); else targetdiv.hide();                                    
                                }
                                //скрытие вкладки
                                var targetnavlink = $('.nav-link[data-table-id='+tableid+']');
                                if (targetnavlink.length>0)
                                {
                                    if (isShow) targetnavlink.parent().show(); else targetnavlink.parent().hide();
                                }
                            }
                        }
                        Core_DoVisibleWithVirtualFieldsRecursivly(e, isShow);
                    }
                });

                //   ActualizeSel2Width(divClass);
                /*
//выравниваем ширину при отображении после видимости
$(newDivClass + '.sel2').each(function (i, v) {
name = $(v).attr('name');
ph = $(v).attr('placeholder');
val1 = $(v).data('val');
$(v).select2({
theme: 'bootstrap-5',
dropdownParent: $(this).parents('.modal').length > 0 ? $(this).parent().parent() : null ,
//width: '100%',
placeholder: $(this).data( 'placeholder' )
,allowClear: true
});});         */

                //выравниваем ширину
                setSelect2ContainerWidth();
                setTextAreaContainerWidth();
            }
        }
    }
}



function Core_ReRenderDynamicForm() {


    if ($('form.wizard').length > 0) { //для мастеров
        $('form fieldset').each(function () {
            Core_LoopFormFieldsForReRender('#' + $(this).attr('id'));
        });
    } else
        if ($('form .ReRenderFormDiv').length > 0) { //для деревьев

            $('form .ReRenderFormDiv').each(function () {
                Core_LoopFormFieldsForReRender('#' + $(this).attr('id'));
            });
        } else if ($('form.newValidate').length > 0) { //для вкладочных

            Core_LoopFormFieldsForReRender('form.newValidate');

        }
        else {
            Core_LoopFormFieldsForReRender('form.newValidateModal');
        }

}

function Core_LoopFormFieldsForReRender(div) {
    var f = true;
    $(div + ' .firstFormDiv').each(function () {

        var firstDivElem = $(this);
        if (firstDivElem.css('display') != 'none') {
            var n = firstDivElem.css('clear');

            if (n == 'both' && f) {
                f = false;
            } else
                if (!f && n == 'both') {
                    firstDivElem.css('clear', 'none');
                    f = true;
                } else if (f && n != 'both') {
                    firstDivElem.css('clear', 'both');
                    f = false
                } else if (!f && n != 'both') {
                    f = true;
                }
        }
    }
    );
}


function Core_InitVisiblesAndTMs(divClass) {

    //инициализируем изменение видимости и трансмутации зависимых полей от изменения значения влияющего поля

    $(divClass + ' input').add(divClass + ' .sel2').on('change', function () {
        //работа с видимостями, находим все зависимые поля и проверяем условия видимости
        var visibleInfl = $('.visibleinfluenser.' + $(this).attr('id'));
        var changeInfl = $('.changeinfluenser.' + $(this).attr('id'));


        var canDoChangeExternalInfluence = true;

        try {
            if ($(this).data('fieldid') === 236515 || $(this).data('fieldid') === 236529 || $(this).data('fieldid') === 237229
            ) {
                canDoChangeExternalInfluence = false;
            }
        } catch (e) { }
        if (changeInfl.children().length > 0 && canDoChangeExternalInfluence) {

            changeInfl.children().each(function () {
                // элемент на который оказываем влияние
                var changeTMfield = Core_GetTMElementByListDiv($(this));
                Core_DoChangeExternalInfluence(changeTMfield, false, false, divClass); //а видим ли я в зависимости от внешних факторов?
            });

        }


        if (visibleInfl.children().length > 0) {

            visibleInfl.children().each(function () {
                var visTMfield = Core_GetTMElementByListDiv($(this));
                Core_DoVisibleExternalInfluence(visTMfield, divClass); //а видим ли я в зависимости от внешних факторов?
            });
            Core_ReRenderDynamicForm();
        }

        Core_DoTransmutationInfluence($(this));

    });

    var a = [];

    //  инициализируем начальную видимость полей, зависящих от полей вне текущей модальной формы
    $(divClass + ' input').add(divClass + ' .sel2').add(divClass + ' textarea').each(function () {
        if ($(this).attr('id') != '' && $(this).attr('id') != undefined) {
            var visTMfield = $('.visibleTMs.' + $(this).attr('id'));
            if (visTMfield.children().length > 0) {

                Core_DoVisibleExternalInfluence($(this), divClass);
            }



            Core_DoTransmutationInfluence($(this), a);

        }
    })

    Core_ReRenderDynamicForm();

}

function Core_ProcessJsonFields(jsonFields) {
    var obj = JSON.parse(jsonFields);
    for (var i = 0; i < obj.fields.length; i++) {
        var currentDiv = $('.div_' + obj.fields[i].fauxname);
        SetValueToField(currentDiv, obj.fields[i].fval, obj.fields[i].fhint, false, '');
    }
}

function Core_ProcessJsonFieldsArray(jsonFields) {
    var obj = jsonFields;
    for (var i = 0; i < obj.fields.length; i++) {
        var currentDiv = $('.div_' + obj.fields[i].fauxname);
        SetValueToField(currentDiv, obj.fields[i].fval, obj.fields[i].fhint, false, '');
    }
}

function Core_ProcessFormTariff(jsonFields, message) {

    Core_ProcessJsonFields(jsonFields);
    $('#submitMain').hide();
    getNewTost(message);
}

function Core_UpdateFormAsFieldDetails(el,ParentLookUpClass) {

    var parentDiv = $('.div_' + el.attr('id'));
    if (parentDiv.length > 0 && parentDiv.data('fieldasform') == 1) {
        var parentaboluteid = el.data('absoluteid');
        var childabsoluteid = parentDiv.data('childabsoluteid');
        
$('.' + ParentLookUpClass + ' .elementawait').show();
//Core_FormAwaiter('start', 'UpdateFormAsFieldDetails ' + el.attr('id'));
        
        $.ajax({
            url: "/Forms/GetFormAsFieldData_",
            type: "get",
            data: {
                id: el.val(),
                tableid: el.data('srctableid'),
                parentabsoluteid: parentaboluteid,
                childabsoluteid: childabsoluteid,
                parentfieldid: el.data('fieldid')
            },
            timeout: 60000,
            dataType: "text",
            success: function (res) {
                if (Core_HandleStringExceptionError(res) && res.length > 0) {
                    // ClearFormAsFeild(el.data('absoluteid'));
                    $('.integrated-form[data-parentabsoluteid=' + (childabsoluteid) + ']').not('[data-absoluteid=' + (childabsoluteid + 1) + ']').hide();
                    $('.btn-add-integrated-form[data-absoluteid=' + (childabsoluteid + 1) + ']').show();

                    var obj = JSON.parse(res);
                    var formHasData = false;
                    for (var i = 0; i < obj.fields.length; i++) {
                        if (obj.fields[i].fauxname == 'bonusmalus') {
                            var currentInput = parentDiv.parent().find('input[data-name="' + obj.fields[i].fauxname + '"]');
                            var inputDiv = $('.div_' + currentInput.attr('name'));
                            SetValueToField(inputDiv, obj.fields[i].fval, obj.fields[i].fhint, false, '');
                        } else {
                            if (obj.fields[i].fauxname == 'tableasfield'){
                                CORE_CompleteTableAsField( obj.fields[i].fval.tableid,  obj.fields[i].fval.dimid, null, obj.fields[i].fval.parentlinkid, obj.fields[i].fval.definition, obj.fields[i].fval.absoluteid);
                            } else {
                                var currentDiv = $('.div_' + obj.fields[i].fauxname);
                                if (obj.fields[i].fname == 'id') {
                                    if (obj.fields[i].fval != "") {
                                        formHasData = true;
                                    }
                                    else { formHasData = false; }
                                }
                                SetValueToField(currentDiv, obj.fields[i].fval, obj.fields[i].fhint, false, '');
                                if (currentDiv.length > 0 && formHasData) {
                                    var parentIntegratedDiv = $('.div_' + obj.fields[i].fauxname).parent().parent();
                                    if (parentIntegratedDiv.hasClass('integrated-form')) {
                                        var absoluteId = parentIntegratedDiv.data('absoluteid');
                                        var addButton = $('.btn-add-integrated-form[data-absoluteid=' + (absoluteId - 1) + ']');

                                        if (!(addButton.css('display') == 'none')) {
                                            addButton.click();
                                        }
                                    }

                                }
                            }
                        }
                    }
                }
                $('.' + ParentLookUpClass + ' .elementawait').hide();
                //Core_FormAwaiter('stop', 'UpdateFormAsFieldDetails ' + el.attr('id'));
            },
            error: function (a, b, c) {
                if (b === "timeout") {
                    getNewTost('Истекло время ожидания запроса', 'error');
                }
                Core_FormAwaiter('stop', 'UpdateFormAsFieldDetails ' + el.attr('id'));
                //   disableDependentFields($('.TMinfluenser.' + el.attr('id')).children(), false)
            }
        });
    };
}

//работа с трансмутациями, находим все зависимые поля и выполняем действия
function Core_DoTransmutationInfluence(el, a) {
    var TMInfl = $('.TMinfluenser.' + el.attr('id'));
    if (TMInfl.children().length > 0) {
        var mydata = "";
        var myvalues = "";
        var needDoTM = true;
        var needDoForCreateTM = false;
        var fieldsInfo = el.data('name');
        TMInfl.children().each(function () {
            var TMfield = Core_GetTMElementByListDiv($(this));
            if ($(this).data('hascreatetm') == 1) needDoForCreateTM = true;
            if (a != undefined) {
                if (a[TMfield.attr('id')] == undefined) {
                    needDoTM = true;
                    a[TMfield.attr('id')] = 1;
                } else needDoTM = false;
            }

            if (mydata.indexOf(TMfield.attr('id')) < 0) {
                var sobaka = mydata.length > 0 ? "@" : "";
                mydata += sobaka + TMfield.attr('id'); //массив трансмутаций
                myvalues += sobaka + TMfield.val(); //массив значений влияющих полей
                fieldsInfo += (fieldsInfo.indexOf(' to ') < 0 ? ' to ' : '') + TMfield.data('name') + ' ';
            }
        });

        if ($('#isreadonly').val() == -1) { needDoTM = false }
        if (needDoTM && !needDoForCreateTM) {
            Core_FormAwaiter('start', '.TMinfluenser.' + el.attr('id') + ' ' + fieldsInfo);
            disableDependentFields($('.TMinfluenser.' + el.attr('id')).children(), true)
            $.ajax({
                url: "/" + ($('#controller').val() !== 'World' ? 'Form' : "World") + "/GetTransmutationFieldsDefinition",
                type: "get",
                data: {
                    id: $('#recordid').val(), tableid: $('#tableid').val(), dimid: $('#dimid').val(),
                    inflfieldsvalues: el.val(), fieldsTMs: mydata, externalTMs: '', currentFieldValues: myvalues
                },
                timeout: 60000,
                dataType: "text",
                success: function (res) {
                    if (Core_HandleStringExceptionError(res) && res.length > 0) {

                        var arr = mydata.split('@');
                        for (var i = 0; i < arr.length; i++) {
                            var newfielddefinition = res.substring(res.indexOf('<' + arr[i] + '>') + 2 + arr[i].length, res.indexOf("</" + arr[i] + ">"));
                            var fld = $('#' + arr[i]);
                            var par = $('#div_' + arr[i]);
                            if (par.length > 0) { //заменяем поле на новый HTML
                                par.replaceWith(newfielddefinition);
                                Core_InitValidation('.div_' + arr[i]);
                            }
                        }
                    }
                    Core_FormAwaiter('stop', '.TMinfluenser.' + el.attr('id') + ' ' + fieldsInfo);
                },
                error: function (a, b, c) {
                    if (b === "timeout") {
                        getNewTost('Истекло время ожидания запроса', 'error');
                    }
                    Core_FormAwaiter('stop', '.TMinfluenser.' + el.attr('id') + ' ' + fieldsInfo);
                    disableDependentFields($('.TMinfluenser.' + el.attr('id')).children(), false)
                }
            });
        } else if (needDoForCreateTM) {

            TMInfl.children().each(function () {

                if ($(this).data('hascreatetm') == 1) {
                    var isShowEditable = true;
                    var TMfield = Core_GetTMElementByListDiv($(this));
                    var settingsTMs = $('.settingsTMs.' + TMfield.attr('id'));
                    settingsTMs.children().each(function () {
                        var inflfield = Core_GetInflElementByListDiv($(this));
                        if (inflfield.length > 0) {
                            par = $('.fieldBorderDiv.div_' + TMfield.attr('id'));
                            isShowEditable = isShowEditable && Core_CompareValueWithCondition(inflfield, par, $(this));
                        }
                    });
                    var editablepart = $('.' + TMfield.attr('id') + '_editablepart');
                    var readablepart = $('.' + TMfield.attr('id') + '_readablepart');
                    if (isShowEditable) {
                        if (!$('#wizard').length > 0) editablepart.find('#' + TMfield.attr('id') + '_NOTACTIVE').attr('id', TMfield.attr('id')).attr('name', TMfield.attr('id'));
                        editablepart.show();
                        readablepart.hide();
                        if (!$('#wizard').length > 0) readablepart.find('#' + TMfield.attr('id')).attr('id', TMfield.attr('id') + '_NOTACTIVE').attr('name', TMfield.attr('id') + '_NOTACTIVE');
                    } else {
                        if (!$('#wizard').length > 0) readablepart.find('#' + TMfield.attr('id') + '_NOTACTIVE').attr('id', TMfield.attr('id')).attr('name', TMfield.attr('id'));
                        readablepart.show();
                        editablepart.hide();
                        if (!$('#wizard').length > 0) editablepart.find('#' + TMfield.attr('id')).attr('id', TMfield.attr('id') + '_NOTACTIVE').attr('name', TMfield.attr('id') + '_NOTACTIVE');
                    }
                }
            });
        }
    };
}

//Поиск родителя по иерархии родителей текущего элемента по классу
function Core_FindParentByClass(elem, attrclass) {
    var fe = null;
    if (elem.hasClass(attrclass)) return elem;
    else
        if (elem.hasClass('wrapper')) return null;
        else
            fe = Core_FindParentByClass(elem.parent(), attrclass);
    return fe;
}

function Core_DoWizardFieldEcho(el) {
    $('.div_' + el.attr('id')).find('.echowizardfield').each(function () {
        if (el.val() === '' || el.val() == null || (el.val() + ' ' == ' ')) {
            $(this).text('');
        } else {
            if ($('#' + el.attr('id')).find('option').length > 0) {
                if ($('#' + el.attr('id') + '[multiple]').length > 0) {
                    var t = '';
                    for (var i = 0; i < el.val().length; i++) {
                        if (el.val()[i] + ' ' != ' ')
                            t += (t.length > 0 ? ',' : '') + $('#' + el.attr('id')).find('option[value=' + el.val()[i] + ']')[0].text;
                    }
                    $(this).text(t);
                } else
                    $(this).text($('#' + el.attr('id')).find('option[value=' + el.val() + ']')[0].text);
            } else {
                $(this).text(el.val());
            }
        }
    });
}

Array.prototype.remove = function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};


function Core_InitIChecks(divClass) {
    var elements = $(divClass).find('.i-checks.radio-select');
    var valueInput = elements.parent().find(".radio-value").trigger('change');
    var getCheckedValues = function (element) {
        return element.closest('.radio-select').find(".radio-control").filter(":checked").map(function () {
            return this.value;
        }).get();
    };
    var setCheckedValues = function (elements, values) {
        var checkedValues = getCheckedValues($(elements[0])).join(',');
        if (checkedValues != values.join(','))
            elements.iCheck('uncheck').filter(function () {
                return values.indexOf(this.value) != -1;
            }).iCheck('check');
    };
    elements.iCheck({ checkboxClass: 'icheckbox_square-blue', radioClass: 'iradio_square-blue', })
        .on('ifChanged', function (event) {
            var value = getCheckedValues($(this));
            var el = $('#' + this.name.substring(0, this.name.length - 6));
            el.val(value.join(',')).trigger('input').trigger('change');
            Core_DoSelectInfluence(el, true, false, divClass);
        }).on('ifClicked', function (event) {
            var value = getCheckedValues($(this));
            var el = $('#' + this.name.substring(0, this.name.length - 6));
            if ($(this).filter('[type="radio"]') && value[0] == el.val())
                $(this).iCheck('uncheck')
        });
    valueInput.on('input change', function () {
        var el = $(this);

        var values = el.val().split(',');
        var controls = $('[name="' + this.name + '_radio"]');
        setCheckedValues(controls, values);
        if (el.val() == el.data("evoldvall") || (el.val() == null && el.data("evoldvall") == "")) {
            el.closest('.ev-input-group').find('.evBtnCancel').attr('disabled', true);
        } else {
            el.closest('.ev-input-group').find('.evBtnCancel').removeAttr('disabled');
        }
    });
}

var currentValue = 0;

//инициализируем поля с группой
function Core_InitSelect2(divClass) {

    $(divClass).find('.sel2').each(function (i, v) {
        var el = $(this);
        $(v).select2({ //инициализируем группу
            theme: 'bootstrap-5',
            dropdownParent: $(this).parents('.modal').length > 0 ? $(this).parent().parent() : null,
            //width: '100%',
            data: null,
            placeholder: $(this).data('placeholder')
            , allowClear: true
        });

        el.val(el.data('val') != null ? el.data('val').toString().split(',') : null).trigger("change"); //выставляем значение по умолчанию

        if (el.hasClass('selectP')) {
            Core_DoSelectExternalInfluence(el, false, true, divClass); //подтягиеваем выборку согласно имеющимся зависимостям


        }

        Core_DoWizardFieldEcho(el);
        //выравниваем ширину
        setSelect2ContainerWidth();
        setTextAreaContainerWidth();
    });
    // Рабочее решение
    //$(document).on('select2:open', (e) => {
    //    var id = e.target.id
    //    $(document.querySelector('[aria-controls="select2-'+id+'-results"]')).get(0).focus()
    //});

    // Не работает
    //$(document).on('select2:open', () => {
   //     document.querySelector('.select2-search__field').focus();
   // });

    // Главное перед фокусом вызвать get(0);
   $(divClass + ' .sel2').on('select2:open', function () {
        var el = $(this);
        var arr = $('[aria-controls="select2-'+el.attr('id')+'-results"]');
        arr.get(0).focus();
    });

    //если нажался крестик
    $(divClass + ' .sel2').on('change', function () {
        var el = $(this);
        var flag = true;

        if (flag) {
            if (el.val() === '' || el.val() == null) {

                //если это родитель, то очищаем детей
                if ($('.selectinfluenser.' + el.attr('id')).length > 0) {
                    $('.selectinfluenser.' + el.attr('id')).children().each(function () {
                        var selectfield = Core_GetTMElementByListDiv($(this));
                        selectfield.find('option').remove();
                        selectfield.val('').trigger('change');
                    })
                }


            } else {
                Core_DoSelectInfluence(el, true, false, divClass); //производим влияние на зависимые от родителя выборки
            }

            //регулируем кнопки возврата
            if (el.val() == el.data("evoldvall") || (el.val() == null && el.data("evoldvall") == "")) {
                el.parent().children('.btn-group').children('.evBtnCancel').attr('disabled', true);
            } else {
                el.parent().children('.btn-group').children('.evBtnCancel').removeAttr('disabled');
            }

          //  $(this).parent().parent().find('div.evErrorBlock label').text('');
             Core_ClearValidationError($(this).parents('.firstFormDiv'));

            Core_DoWizardFieldEcho(el);

            //активируем кнопки валидации
            Core_SetUpFormButtons(divClass);

           
        }
        //выравниваем ширину
        setSelect2ContainerWidth();
        setTextAreaContainerWidth();
    });

}

function Core_DoReRenderField(selectfield, divClass, ismulty, markfieldid) {


    if (markfieldid == "-1") {

    } else {

        var templatetype = "FIELDID";
        $.ajax({
            url: "/Global/ReRenderFieldByTemplate",
            type: "get",
            data: {
                tableid: selectfield.data('tableid'),
                templateinfo: selectfield.val(),
                templatetype: templatetype,
                markfieldid: markfieldid,
                ismulty: ismulty,
                parentlinkid: $(divClass + ' #parentlinkid_post').val(),
                defaultvalue: $(divClass + ' [data-fieldid=' + markfieldid + ']').val()
            },
            timeout: 60000,
            dataType: "text",
            success: function (res) {
                if (res != null) {
                    var inp = $(divClass + ' [data-fieldid=' + markfieldid + ']');
                    var div = $(divClass + ' #div_' + inp.attr('name'));
                    div.replaceWith(res);
                    Core_InitValidation('.div_' + inp.attr('name'));
                }
            }
        });
    }

}

//Получить фильтр для дочернего поля, повергающегося влиянию
function Core_GetFilterBySelectField(selectfield, divClass, tmclass) {
    var filter = '';
    //Если несколько влияющих полей, то варганим сложный фильтр
    var sftms = $(divClass + ' .' + tmclass + '.' + selectfield.attr('id'));
    if (sftms.children().length > 1) {
        sftms.children().each(function () {//берем влияющие поля трансмутирующего элемента
            var inflfield = Core_GetInflElementByListDiv($(this));
            if (inflfield.val() == null) return '-';
            if (inflfield.val().length > 0)
                filter += (filter.length > 0 ? "#" : "") + inflfield.data('tablename') + '_' + inflfield.data('name') + '@' + inflfield.val() + '@' + $(this).data('selectfilterid');
        });
    } else if (sftms.children().length == 1) {
        var inflfield = Core_GetInflElementByListDiv(sftms.children());
        if (inflfield.length > 0)
            filter = inflfield.data('tablename') + '_' + inflfield.data('name') + '@' + inflfield.val() + '@' + sftms.children().data('selectfilterid');
        if ((filter.split('@')[1] == "" || filter == null) && sftms.children().data('isvirtual') == '1') {
            filter = '-'; //если имеем дело с пустым виртуальным полем, то не хотим его влияния на дочки.
        }
    }
    return filter;
}

//Получить элемент дочернего поля по информации во влияющем поле
function Core_GetTMElementByListDiv(listdivelem) {
    var selectfield = $('#' + listdivelem.data('tmfieldid'));

    if (listdivelem.data('tmfieldidsrc') != undefined && listdivelem.data('tmfieldidsrc') != "")
        selectfield = $('#' + listdivelem.data('tmfieldidsrc'));
    return selectfield;
}
function Core_GetInflElementByListDiv(listdivelem) {

    if (listdivelem.data('inflfieldid') == 0) {
        var selectfield = $(0);
    }
    else {
        var selectfield = $('#' + listdivelem.data('inflfieldid'));

    }
    if (listdivelem.data('inflfieldidsrc') != undefined && listdivelem.data('inflfieldidsrc') != "")
        selectfield = $('#' + listdivelem.data('inflfieldidsrc'));
    return selectfield;
}

//оказание влияния на выборку дочерних полей родительского поля
function Core_DoSelectInfluence(e, needClear, needSetDefault, divClass) {

    if (divClass == 'unknown') //если влияющим полем оказался лукап
    {
        if ($('.newValidateModal .selectinfluenser.' + e.attr('id')).children().length > 0
        ) divClass = '.newValidateModal'; else divClass = '.newValidate';
    }

    $(divClass + ' .selectinfluenser.' + e.attr('id')).children().each(function () {
        var selectfield = Core_GetTMElementByListDiv($(this));
        if (selectfield.length > 0)
            Core_DoSelectExternalInfluence(selectfield, needClear, needSetDefault, divClass)
    });
}


//получение родительских значений для фильтра собственной выборки и своих братьев по выборке
function Core_DoSelectExternalInfluence(e, needClear, needSetDefault, divClass) {

    var eborderdiv = $('.fieldBorderDiv.div_' + e.attr('id'));
    if (eborderdiv.find('.selectvalues').length > 0) {
        var values = [];
        var sel2 = eborderdiv.find('.sel2');
        eborderdiv.find('.selectvalues').each(function () {

            if (values.length == 0) {
                var gotValues = true;
                $(this).children().each(function () {
                    var inflfield = Core_GetInflElementByListDiv($(this));
                    if (inflfield.length > 0) {

                        gotValues = gotValues && Core_CompareValueWithCondition(inflfield, eborderdiv, $(this));
                    }
                });
                if (gotValues) {
                    values = $(this).data('values').toString().split(',');
                    var validvalue = false;
                    if (values[0] != '$ALL') {
                        eborderdiv.find('option').attr('disabled', true);

                        for (var i = 0; i < values.length; i++) {
                            eborderdiv.find('option[value=' + values[i] + ']').each(function () {
                                $(this).attr('disabled', false);
                                if (values[i] == sel2.val()) {
                                    validvalue = true;
                                }
                            });

                        }

                        if (!validvalue) {

                            if (sel2.find('option[disabled!="disabled"]')[0] != undefined) {
                                var currentValue = sel2.data('evoldvall');
                                if (sel2.find('option[disabled!="disabled"]')[0].value != currentValue) {
                                    sel2.find('option[value =currentValue]')
                                }

                                sel2.val(sel2.find('option[disabled!="disabled"]')[0].value).trigger('change');

                            }
                        }
                    } else {
                        eborderdiv.find('option').attr('disabled', false);
                    }
                    sel2.each(function (i, v) {
                        var el = $(this);
                        $(v).select2({ //инициализируем группу
                            theme: 'bootstrap-5',
                            dropdownParent: $(this).parents('.modal').length > 0 ? $(this).parent().parent() : null,
                            //width: '100%',
                            placeholder: $(v).data('placeholder')
                            , allowClear: true
                        });
                        setSelect2ContainerWidth();
                        setTextAreaContainerWidth();
                    });
                    return;
                }

            }
        });
    }

    else {

        var filter = Core_GetFilterBySelectField(e, divClass, 'selectTMs');
        if (filter == null) filter = '';
        if (filter != '-') {
            Core_DoSelectDataAjax(e, (filter.length > 0 ? filter : '0@0@0'), needClear, needSetDefault, divClass);
        }
    }
}

//запрос на получение данных для группы во время изменения значений во влияющих полях

function Core_DoSelectDataAjax(fld, filter, needClear, needSetDefValue, divClass) {
    //запоминаем список влияющих полей дочки, чтобы не затирать значения выборок с одинаковым селектом, но разными родителями
    var fldtms = $(divClass + ' .selectTMs.' + fld.attr('id'));
    var fldallselectTMIDs = '';
    if (fldtms.length > 0 && fld.data('selid') != undefined) {
        fldallselectTMIDs = fldtms.data('allselecttmids');
        Core_FormAwaiter('start', divClass + ' .selectTMs.' + fld.attr('id') + ' ' + fld.data('name'));
        //Деактивирует зависимые поля

        disableDependentFields($('*[data-selid="' + fld.data('selid') + '"]'), true);

        $.ajax({
            url: "/Global/GetSelectDataById",
            type: "post",
            data: {
                SELECTID: fld.data('selid'), FILTER: filter, TABLEID: fld.data('tableid')
            },
            timeout: 60000,
            dataType: "text",
            success: function (res) {
                if (res != null) {
                    if (res.includes('исключение'))
                        return getNewTost(res, 'error');
                    var selectGroup = $(divClass + ' .selectP[data-selid="' + fld.data('selid') + '"]');
                    //переинициализируем группу новыми значениями
                    selectGroup.each(function () {
                        var needUpdate = false;
                        var needSetSelectValue = true;
                        //получаем список влияющих полей текущего селекта
                        var etms = $(divClass + ' .selectTMs.' + $(this).attr('id'));
                        if (etms.length > 0) {
                            if (etms.data('allselecttmids') == fldallselectTMIDs) {
                                needUpdate = true;
                            }
                        }

                        //обновляем поля селекта только при полном совпадении совокупности влияющих полей
                        if (needUpdate) {

                            $(this).find('option').remove();

                            $(this).select2({
                                theme: 'bootstrap-5',
                                dropdownParent: $(this).parents('.modal').length > 0 ? $(this).parent().parent() : null,
                                //width: '100%',

                                data: JSON.parse(res), //тут был ивал (res) убираем по требованию СБ
                                placeholder: $(this).data('placeholder')
                                , allowClear: true
                            });

                            if (needClear) {
                                //если текущий селект имеет только одно значение по умолчанию, то его не нужно очищать
                                if ($(this).find('option[value="' + $(this).data('evoldvall') + '"]').length == 0) {
                                    $(this).val(0).trigger('change');
                                } else {
                                    $(this).val($(this).data('evoldvall')).trigger('change');
                                }
                                //если нужно подгрузить и установить былое значение при отмене ввода значения
                            } else if (needSetDefValue) {
                                needSetSelectValue = false;
                                var eborderdiv = $('.fieldBorderDiv.div_' + $(this).attr('id'));

                                var changeFlag = false;
                                if (eborderdiv.find('.changevalues').length > 0) {
                                    changeFlag = Core_DoChangeExternalInfluence($(this), false, false, divClass);
                                }

                                if (!changeFlag) {
                                    if ($(this).find('option[value="' + $(this).data('evoldvall') + '"]').length == 0) {
                                        if ($(this).data('evoldvall').toString().length > 0) {

                                            if ($(this).data('multiple') == 'multiple') {
                                                $(this).val($(this).data('evoldvall').toString().split(',')).trigger('change');
                                            }
                                            else {
                                                if ($(this).find('option')[0] != undefined)
                                                    $(this).val($(this).find('option')[0].value).trigger('change');
                                            }
                                        } else {
                                            $(this).val($(this).data('evoldvall')).trigger('change');
                                        }
                                    } else {
                                        $(this).val($(this).data('evoldvall')).trigger('change');
                                    }
                                }
                            }

                        }
                        if (needSetSelectValue) { //нужно для восстановления значения поиска при виртуальных влияющих полях
                            try {
                                $(this).val($(this).data('val')).change();
                            } catch (e) {
                            }
                        }


                    });

                    setSelect2ContainerWidth();
                    setTextAreaContainerWidth();
                    Core_FormAwaiter('stop', divClass + ' .selectTMs.' + fld.attr('id') + ' ' + fld.data('name'));
                    //Активирует зависмые поля
                    disableDependentFields($('*[data-selid="' + fld.data('selid') + '"]'), false);
                }
            },
            error: function (a, b, c) {
                if (b === "timeout") {
                    getNewTost('Истекло время ожидания запроса получения данных группы id = ' + fld.data('selid') + ' filter = ' + filter, 'error');
                }
                Core_FormAwaiter('stop', divClass + ' .selectTMs.' + fld.attr('id') + ' ' + fld.data('name'));
                //Активирует зависмые поля
                disableDependentFields($('*[data-selid="' + fld.data('selid') + '"]'), false);
            }
        });
    }
};



//устанавливает значение в поле
function SetValueToField(eborderdiv, value, lookupvalue, needSetDefault, divClass) {

    var txt = (lookupvalue != '' && lookupvalue !== null && lookupvalue != undefined) ? '[' + value + '] ' + lookupvalue : value;

    if (value.includes('поддер') || value.includes('телеф') || value.includes('шибка')) {
        getNewTost(value, 'warning');
        return;
    }

    if (eborderdiv.find('.lookup_search').length > 0) {


        EvaluateVal(value, lookupvalue, Core_GetLookupClassByBorderDiv(eborderdiv));

        var el = eborderdiv.find('.lookup_search');
        el.parent().children('.btn-group').children('.evBtnCancel').removeAttr('disabled');
        if (el.data('evoldvall') == el.val()) {
            el.parent().children('.btn-group').children('.evBtnCancel').attr('disabled', true);
        }
        Core_SetUpFormButtons(divClass);

    }
    else if (eborderdiv.find('.sel2').length > 0) {
        eborderdiv.find('.sel2').val(value).trigger('change');
        eborderdiv.find('label.evLabel').text(txt);

    }
    else {

        if (!needSetDefault) {
            eborderdiv.find('input').not('.radio-control').val(value).trigger('input');
            eborderdiv.find('textarea').not('.radio-control').val(value).trigger('input');
            eborderdiv.find('label.evLabel').text(txt);
            eborderdiv.find('input.evLabel').val(txt);
        }

        eborderdiv.find('span').not('.input-group-text').each(function () {
            if (!$(this).find('button').length > 0) {
                $(this).text(txt);
            }
        });

    }
};

function Core_DoChangeExternalInfluence(e, needClear, needSetDefault, divClass) {

    if (divClass == 'unknown') //если влияющим полем оказался лукап
    {
        if ($('.newValidateModal .changeTMs.' + e.attr('id')).children().length > 0
        ) divClass = '.newValidateModal'; else divClass = '.newValidate';
    }

    var eborderdiv = $('.fieldBorderDiv.div_' + e.attr('id'));
    if (eborderdiv.find('.changevalues').length > 0) {
        var value = '';
        var sel2 = eborderdiv.find('.sel2');
        eborderdiv.find('.changevalues').each(function () {
            if (value.length == 0) {
                var gotValue = true;

                $(this).children().each(function () {
                    var changefield = Core_GetInflElementByListDiv($(this));
                    if (changefield.length > 0) {

                        gotValue = gotValue && Core_CompareValueWithCondition(changefield, eborderdiv, $(this));
                    }
                });

                if (gotValue) {

                    value = $(this).data('values').toString();
                    var lookupvalue = value;
                    if (value.indexOf('$MRP') > 0) {
                        value = value.replace('$MRP', '');
                        var mrp = $('#agreemrp').val();
                        value = value * mrp;
                    }
                    if (value.toString().indexOf('$CLAIMHOLDER') >= 0) {
                        value = $('#claimholderid').val();
                        lookupvalue = $('#claimholderid').data('fio');
                    }

                    if (value != '$ALL') {

                        SetValueToField(eborderdiv, value, lookupvalue, needSetDefault, divClass);

                        var validvalue = false;
                    }

                    return true;
                }

            }
        });
    } else {

        valueFromFunc = false;
        var changeTMs = eborderdiv.find(".changeTMs").children();
        var funcid = 0;
        changeTMs.each(function () {
            valueFromFunc = $(this).data('funcid') > 0;
            funcid = $(this).data('funcid');
        });
        // var changeFuncid = e.data('funcid');


        if (valueFromFunc) {

            var filter = Core_GetFilterBySelectField(e, divClass, 'changeTMs');
            if (filter == null) filter = '';
            if (filter != '-') {
                filter = filter.length > 0 ? filter : '0@0@0';

                Core_FormAwaiter('start', divClass + ' .changeTMs.' + e.attr('id') + ' ' + e.data('name'));

                $.ajax({
                    url: "/Global/GetFuncValueById",
                    type: "post",
                    data: {
                        FUNCID: funcid, FILTER: filter, TABLEID: e.data('tableid')
                    },
                    timeout: 60000,
                    dataType: "text",
                    success: function (res) {
                        if (res != 'null') {
                            if (res.indexOf('#') > 0) {
                                var g = res.split('@@');
                                for (var i = 0; i < g.length; i++) {
                                    var h = g[i].split('#');
                                    if (h.length > 1) {
                                        var v = h[2].split('$$$');

                                        $('[data-tablename="' + h[0] + '"][data-name="' + h[1] + '"]').each(function () {
                                            $('div.fieldBorderDiv.div_' + $(this).attr('name')).each(function () {
                                                SetValueToField($(this), v[0], (v.length > 1 ? v[1] : ''), needSetDefault, divClass);
                                            });
                                        });
                                    }
                                }
                            } else {
                                var res1 = res.split('@@@');
                                SetValueToField(eborderdiv, res1[0], res1[1], needSetDefault, divClass);
                            }
                        }
                        Core_FormAwaiter('stop', divClass + ' .changeTMs.' + e.attr('id') + ' ' + e.data('name'));
                    },
                    error: function (a, b, c) {
                        if (b === "timeout") {
                            getNewTost('Истекло время ожидания запроса получения данных группы id = ' + e.data('selid') + ' filter = ' + filter, 'error');
                        }
                        Core_FormAwaiter('stop', divClass + ' .changeTMs.' + e.attr('id') + ' ' + e.data('name'));
                    }
                });
            }
        }

    }
    return false;
}

var logarray = "";
var logarr = [];
//управление глобальным эвэйтером формы
function Core_FormAwaiter(mode, comment) {
    var awaiter = $('.form-awaiter-modal');
    if (awaiter.length == 0) awaiter = $('.form-awaiter');
    //если модальный эвэйтер найден, но сама модалка не видна
    else if (awaiter.parent().parent().parent().parent().parent().css('display') == 'none') {
        awaiter = $('.form-awaiter');
    }


    $(".moneyFormat").each(function () {
        MoneyFormat($(this).attr('id'),false);
    });


    //действия скрытия или отображения производим при счетчике равном нулю
    if (mode == 'start') { //при каждом вызове старта увеличиваем счетчик
        var d = new Date();
        logarr[comment] = d;
        var str = (d.getHours()) + ":" + (d.getMinutes()) + ":" + (d.getSeconds()) + "." + (d.getMilliseconds());
        //c.log('Start count: ' + awaiter.data('initcount') + ' comment: ' + comment + ' time: ' + str);
        if (awaiter.data('initcount') == 0) {
            awaiter.show();
        }
        awaiter.data('initcount', awaiter.data('initcount') + 1);
    }
    if (mode == 'stop') { //при каждом вызове стопа уменьшаем счетчик
        if (awaiter.data('initcount') > 0)
            awaiter.data('initcount', awaiter.data('initcount') - 1);

        var d = logarr[comment];
        var dnow = new Date();
        if (d != null) {
            var str = (dnow.getHours() - d.getHours()) * 60 * 60 * 1000 + (dnow.getMinutes() - d.getMinutes()) * 60 * 1000 + (dnow.getSeconds() - d.getSeconds()) * 1000 + (dnow.getMilliseconds() - d.getMilliseconds());
            var str1 = (dnow.getHours()) + ":" + (dnow.getMinutes()) + ":" + (dnow.getSeconds()) + "." + (dnow.getMilliseconds());
        }

        //c.log('Stop count: ' + awaiter.data('initcount') + ' comment: ' + comment + ' time: ' + str1 + ' diff: ' + str);

        if (awaiter.data('initcount') == 0) {
            awaiter.hide();
        }
    }
}

function disableDependentFields(TMDependents, toDisable) {
    if (TMDependents.length > 0 && toDisable) {
        TMDependents.each(function () {
            $(this).attr('disabled', true);
        });
    }
    else {
        TMDependents.each(function () {
            $(this).attr('disabled', false);
        });
    }
}


function Core_ClearValidationError(divelement) {
    if (divelement != undefined) {
        divelement.find('input').removeClass('is-invalid');
        divelement.find('textarea').removeClass('is-invalid');
        //divelement.find('input').attr('title','');
        divelement.find('input').tooltip('dispose');
        divelement.find('select').removeClass('is-invalid');
        divelement.find('.select2-selection').tooltip('dispose');
    }
}

//Показывает полученный от HTTPPOST текст валидации для каждого невалидного поля
function Core_ShowValidationText(data) {
    var open_first = false;
    for (var i = 0; i < data.length; i++) {
        var arr = data[i].split('#');
        var el = $('#' + arr[0]);
        var divelement = $('.div_' + arr[0]);
        var errlabel = divelement.find('.field-validation-error');
        errlabel.text(arr[1]);

        el.attr('title', arr[1]);
        el.tooltip();
        var lookup = $('#' + arr[0] + '_LOOKUP');
        if (lookup.length > 0) {
            lookup.attr('title', arr[1]); lookup.tooltip();
        }
        divelement.find('input').addClass('is-invalid');
        divelement.find('textarea').addClass('is-invalid');
        divelement.find('select').addClass('is-invalid');
        divelement.find('.select2-selection').attr('title', arr[1]).tooltip();
        // Core_ClearValidationError(divelement);

        var tbl = 'tbl_' + data[i].split('_')[2];
        var ch = $('[id^="' + tbl + '"]').find('.ibox.float-e-margins').find('.ibox-title').find('.ibox-tools').find('.fa').hasClass('fa-chevron-up');
        //разворачиваем вкладку, в которой сработал валидатор
        if ($('[id^="' + tbl + '"]').length > 0 && !open_first && !ch) {
            $('.opened_tab').data('opened_id', 'undefined');
            if ($('[id^="' + tbl + '"]').find('.ibox.float-e-margins').find('.ibox-title').lengh > 0) {
                $('[id^="' + tbl + '"]').find('.ibox.float-e-margins').find('.ibox-title')[0].click();
            }
            open_first = true;
        }
    }
};


//Функция завершения обновления формы на клиенте, чтобы не перезагружать форму заново
function Core_UpdateFieldValues(data) {
    for (var i = 0; i < data.length; i++) {
        var arr = data[i].split('#');
        var el = $('#' + arr[0]);
        if (el.val() != arr[1]) {
            el.val(arr[1]);
        }
        el.data('evoldvall', arr[1]);
        var cancelbtn = $('.evBtnCancel[data-auxfieldid="' + arr[0] + '"]');
        if (cancelbtn.length > 0) {
            cancelbtn.attr('disabled', true);
        }

    }
    //очищаем сообщения не пройденной валидации
    $('.evErrorBlock').children('.field-validation-error').text('');
    Core_ClearValidationError($('.firstFormDiv'));
}

//Активирует или деактивирует ладду на кнопках Добавить/Обновить при работе с формой
function Core_FormBegin(command) {
    currentValue = 0;
    if (command == undefined) {
        command = 'start';
    }
    var activemodal = false;
    $('.modal.inmodal').each(function () {
        if ($(this).css('display') != 'none') activemodal = true;
    });

    if ($('.ladda-button-submit-modal').length > 0 && activemodal) {
        $('.ladda-button-submit-modal').ladda().ladda(command);
    }
    else {
                       
        if (command == "start") {
            SetTreeFormBlock(true);
        } else {
         //   $('.ladda-button-submit').ladda().ladda(command);
Ladda.stopAll();
            SetTreeFormBlock(false);
        }
    }
    Core_FormAwaiter(command, '.LaddaStartStop');

}

function Core_FormError(xhr, status, error) {
    getNewTost(xhr.responseText, 'error');
    Core_FormBegin('stop');
    Core_FormAwaiter('stop', '.LaddaStartStop');
    Core_SetUpFormButtons('');
    ClearFormBlock();
}

// Попытка выловить ошибку, которая блочит форму
function Core_CustomFormError(xhr, status, error) {
   
    if (xhr.status == 0) {
        getNewTost('Возникла ошибка при подключении к серверу приложения. Повторите попытку снова.' + error, 'error');
    } else if (xhr.status == 404) {
        getNewTost('Сервер приложения не найден.', 'error');
    } else {
        getNewTost((xhr.responseText || error), 'error');
    }
    Core_FormBegin('stop');
    Core_FormAwaiter('stop', '.LaddaStartStop');
    Core_SetUpFormButtons('');
    ClearFormBlock();
}

//Деактивирует ладду и снимает защитный экран с формы
function Core_FormSuccess() {

    InitLookup();

    Core_FormBegin('stop');
    Core_FormAwaiter('stop', '.LaddaStartStop');

    Core_SetUpFormButtons('');
    ClearFormBlock();
}

function Core_InitFileUploadForm() {
    if ($('.myajaxform').length > 0) {
        $('.myajaxform').ajaxForm(
            function () {
                Core_FormAwaiter('stop', '.LaddaStartStop');
            });
        $(document).off('click', '.ladda-button-submit-modal');
        $(document).on('click', '.ladda-button-submit-modal', function () {
            Core_FormAwaiter('start', '.LaddaStartStop');

        });
        InitFileUpload();
    }
}

function Core_AfterModalRender() {
    Core_InitFileUploadForm();
    Core_InitValidation('.newValidateModal');
    InitLookup();
  //  Core_InitPrintModal();
    Core_InitContiueModal();

      Init_pwd(); //почему то было убрано и из меню не работала смена пароля
    Init_Randome_Choise();
    Init_Checkbox_Modal();



}

function Init_Checkbox_Modal() {
    $(".drop-down-block").width($(".ev-input-group.input-group").width() - 10);
    $(document).off('click', '.popup-content');
    $(document).on('click', '.popup-content', function () {
        var dd = $(this).data('div');

        $(".drop-down-block").width($(".ev-input-group.input-group").width() - 10);
        if ($("." + dd).css('display') === "none") $("." + dd).show("slide", {
            direction: "up"
        }, 300); else $("." + dd).hide("slide", {
            direction: "up"
        }, 300);

    });
    $(window).off('resize');
    $(window).resize(function () {
       
        $(".drop-down-block").width($(".ev-input-group.input-group").width() - 10);
    });
    $(document).off('click', '.check_checkbox');
    $(document).on('click', '.check_checkbox', function () {
        var el = $(this).parent().parent().parent().find('.evInput.form-control');
        if ($(this).is(':checked')) {
            el.val(el.val() + $(this).data('value') + ',');
        }
        else {
            el.val(el.val().replace($(this).data('value') + ',', ''));
        }
        el.trigger('input');
    });
}



function Init_Randome_Choise() {
    var sign = "введите имя либо часть имени либо подразделение и нажмите Enter";
    $('.randome-choise').select2({
        theme: 'bootstrap-5',
        //dropdownParent: $(this).parents('.modal').length > 0 ? $(this).parent().parent() : null,
        width: '100%',
        placeholder: sign,
        dropdownParent: $('.randome-choise').parent(),
        allowClear: true
    });

    if ($(".randome-choise").length > 0) {
        $(".randome-choise").off('select2:select');
        $('.randome-choise').on('select2:select', function (e) {
            $(this).parent().parent().parent().parent().parent().find('.evBtnUpdateAll').removeAttr('disabled');
        });
    }

    $(document).off('keyup', '.select2-search__field');
    $(document).on('keyup', '.select2-search__field', function (event) {
        if ($(this).parent().parent().parent().parent().parent().parent().find('.randome-choise').length > 0) {
            var code = event.keyCode || event.which;
            if (code === 13) {
                var search = $(this).val();
                if (search.length >= 3) {
                   
                    if (search.toLowerCase() === "clr" || search.toLowerCase() === "клр") {
                        $('.randome-choise').empty();
                        $('.randome-choise').val(null).trigger('change');
                    } else {
                        $.ajax({
                            url: "/Home/DFLSearchTest",
                            type: "post",
                            data: {
                                "search": search
                            },
                            timeout: 60000,
                            dataType: "json",
                            beforeSend: function (xhr) {
                                if ($('.randome-choise').parent().find('span.select2.select2-container').length > 0) {
                                    if ($('.randome-choise').parent().find('span.select2.select2-container').find('.form-awaiter-modal').length <= 0)
                                        $('.randome-choise').parent().find('span.select2.select2-container').append('<div class="form-awaiter-modal" data-initcount="0" style="float: right; display: none;"><div class="sk-spinner sk-spinner-fading-circle" style="left:-31px;top:-29px;"><div class="sk-circle1 sk-circle"></div><div class="sk-circle2 sk-circle"></div><div class="sk-circle3 sk-circle"></div><div class="sk-circle4 sk-circle"></div><div class="sk-circle5 sk-circle"></div><div class="sk-circle6 sk-circle"></div><div class="sk-circle7 sk-circle"></div><div class="sk-circle8 sk-circle"></div><div class="sk-circle9 sk-circle"></div><div class="sk-circle10 sk-circle"></div><div class="sk-circle11 sk-circle"></div><div class="sk-circle12 sk-circle"></div></div></div>');
                                    $('.randome-choise').parent().find('span.select2.select2-container').find('.form-awaiter-modal').show();
                                }

                            },
                            success: function (res) {
                                if (res) {
                                   
                                    $('.randome-choise').select2({
                                        theme: 'bootstrap-5',
                                        dropdownParent: $(this).parents('.modal').length > 0 ? $(this).parent().parent() : null,
                                        width: '100%',
                                        placeholder: sign,
                                        allowClear: true,
                                        data: res
                                    });
                                    $('.randome-choise').parent().find('span.select2.select2-container').find('.form-awaiter-modal').hide();
                                    $('.randome-choise').select2('open');
                                }
                            },
                            timeout: function () {
                                $('.randome-choise').parent().find('span.select2.select2-container').find('.form-awaiter-modal').hide();
                                getNewTost('Истекло время ожидания запроса', 'error');
                            },
                            statusCode: {
                                404: function () {
                                    $('.randome-choise').parent().find('span.select2.select2-container').find('.form-awaiter-modal').hide();
                                    getNewTost('По вашему запросу ничего не найдено.', 'warning');
                                }
                            }
                        });
                    }
                }
            }
        }
    });
}

function Init_chosen() {
    var ch = $(".chosen-select-width");
    if (ch.length > 0) {
        $(document).off('change', '.chosen-select-width');
        $(document).on('change', '.chosen-select-width', function () {
            $('.btn-down-password').removeAttr('disabled');
            $('#errorlabel').html('');
        });
        $(".chosen-select-width").chosen({ width: '100%', placeholder_text_single: 'Выберите пользователя...' }).data('chosen').container.bind('keyup', function (event) {
            var code = event.keyCode || event.which;
            if (code === 13) {
                var search = $(".chosen-search-input").val();
                if (search.length >= 3) {
                    if (search.toLowerCase() === "clr") {
                        $('.chosen-select-width').empty();
                        var newOption = $('<option value=""></option>');
                        $('.chosen-select-width').append(newOption);
                        $('.chosen-select-width').trigger("chosen:updated");
                    } else {
                        $.ajax({
                            url: "/Home/UpdateContent",
                            type: "post",
                            data: {
                                "search": search
                            },
                            timeout: 60000,
                            dataType: "text",
                            success: function (res) {
                                if (res) {
                                    var json_obj = $.parseJSON(res);
                                    var org = "";
                                    var k = 0;
                                    $(json_obj).each(function (index) {
                                        var q = $('.chosen-select-width').chosen().val();
                                        var flag = false;
                                        var exopt = false;
                                        if (q.length) {
                                            for (var i = 0; i < q.length; i++) {
                                                if ("" + q[i] === "" + this.ID) {
                                                    flag = true;
                                                    break;
                                                }
                                            }
                                        }
                                        if (!flag) {
                                            $(".chosen-select-width option[value='" + this.ID + "']").remove();
                                            if (org !== this.STUFF) {
                                                k++;
                                                var ex = $("#OPT_" + k);
                                                while (ex.length) {
                                                    if (ex.closest('optgroup').attr('label') !== this.STUFF) {
                                                        k++;
                                                        ex = $("#OPT_" + k);
                                                    } else {
                                                        exopt = true;
                                                        $("#OPT_" + k).append('<option value="' + this.ID + '">' + '[' + this.ID + '] ' + this.PUSER + ' / ' + this.FIO + '</option>');
                                                        break;
                                                    }
                                                }
                                                if (!exopt) {
                                                    $('.chosen-select-width').append("<optgroup id='OPT_" + k + "' label='" + this.STUFF + "'></optgroup>");
                                                    $("#OPT_" + k).append('<option value="' + this.ID + '">' + '[' + this.ID + '] ' + this.PUSER + ' / ' + this.FIO + '</option>');
                                                    $("#OPT_" + k).append('<option></option>');
                                                }
                                            }
                                            else {
                                                $("#OPT_" + k).append('<option value="' + this.ID + '">' + '[' + this.ID + '] ' + this.PUSER + ' / ' + this.FIO + '</option>');
                                            }
                                            org = this.STUFF;

                                        }
                                    });
                                    $('.chosen-select-width').trigger("chosen:updated");
                                }
                            },
                            error: function (a, b, c) {
                                if (b === "timeout") {
                                    getNewTost('Истекло время ожидания запроса', 'error');
                                }
                            }
                        });
                    }
                }
            }
        });
    }
}

function Core_InitMoneyTypeInput() {
    $('.moneyFormat').on('keyup', function () {
        MoneyFormat(event.target.id,true);
      
    });
};


function SetMoneyFormat(param) {

    var str = param.replace(/[^0-9\., ]/g, '');;

    str = str.replace(/ /ig, '');
    var n = str.indexOf(",");
    if (n == -1) {
        n = str.length;
        n = str.indexOf(".");
        if (n == -1) {
            n = str.length;
        }
    }

    if (n > 3 && n % 3 >= 0) {
        var cnt = n;
        var text = str;
        for (var i = 3; i < cnt; i++) {
            if (i % 3 == 0) {
                text = text.insert(cnt - i, " ");
            };
        };
        return text;
    } else {
        return str;
    };

}


function SetDateFormat(str) {

    if (str.length == 2) {
        return str.substr(0, 2) + '.';
    } else
        if (str.length == 3) {
            return str.substr(0, 2) + '.' + str.substr(2, 1);
        } else
            if (str.length == 4) {
                return str.substr(0, 2) + '.' + str.substr(2, 2) + '.';
            } else
                if (str.length >= 5) {
                    return str.substr(0, 2) + '.' + str.substr(2, 2) + '.' + str.substr(4, str.length > 8 ? 4 : str.length - 4);
                }
    return str;
}

function DateFormat(inp) {
    if (inp != null) {
        if (inp.val().length > 0) {
            var str = inp.val().replace(/[^0-9\. ]/g, '').replace(/\ /g, '').replace(/\./g, '');

            if (str.length < 5) {
                var pp = doGetCaretPosition(inp);
                inp.val(SetDateFormat(str));

                if (str.length == 2 || str.length == 4) {
                    setCaretPosition(inp, pp + 1);
                }
            } else inp.val(SetDateFormat(str));
        }
    }
}


function MoneyFormat(elemId, needcaret) {
    var inp = document.getElementById(elemId);
    var idName = elemId;
    var pos = idName.lastIndexOf("_view");
    if (idName.lastIndexOf("_NOTACTIVE_view") > 0) {
        pos = idName.lastIndexOf("_NOTACTIVE_view");
    }
    var idNameHidden = idName.substring(0, pos);
    var inpHidden = document.getElementById(idNameHidden);
    var l = 0;
    if (needcaret == undefined) {
        needcaret = false;
    }

    if (inp != null) {
        var val = '';
        if (inp.value != undefined) {
            val = inp.value;
        } else {
            if (pos > 0 && inp.title != undefined) {
                val = inp.innerText;
            }
        }
        var hasMinus = val.substring(0, 1) == '-';
        var pp = !needcaret ? 0 : doGetCaretPosition(inp);
        if (inp != null && inp.value != undefined) {
            l = val.length;

            inp.value = (hasMinus ? "-" : "") + SetMoneyFormat(val);

            l = inp.value.length - l;

            if (inpHidden != null)
                inpHidden.value = (hasMinus ? "-" : "") + val.replace(/[^0-9\., ]/g, '').replace(/ /ig, '');
        } else if (inp != null && inp.title != undefined) {
            inp.textContent = (hasMinus ? "-" : "") + SetMoneyFormat(inp.textContent);
            /* inp.textContent = inp.textContent.replace(/[^0-9\., ]/g, '');
             var str = inp.textContent;
     
             str = str.replace(/ /ig, '');
             var n = str.indexOf(",");
             if (n == -1) {
                 n = str.length;
                 n = str.indexOf(".");
                 if (n == -1) {
                     n = str.length;
                 }
             }
     
             if (n > 3 && n % 3 >= 0) {
                 var cnt = n;
                 var text = str;
                 for (var i = 3; i < cnt; i++) {
                     if (i % 3 == 0) {
                         text = text.insert(cnt - i, " ");
                     };
                 };
                 inp.textContent = text;
             } else {
                 inp.textContent = str;
             };*/
            if (inpHidden != null)
                inpHidden.value = (hasMinus ? "-" : "") + inp.textContent.replace(/[^0-9\., ]/g, '').replace(/ /ig, '');
        }
        if (needcaret)
        setCaretPosition(inp, pp + l);
    }
};

function doGetCaretPosition(ctrl) {
    var CaretPos = 0;

    if (ctrl.selectionStart || ctrl.selectionStart == 0) {// Standard.
        CaretPos = ctrl.selectionStart;
    }
    else if (document.selection) {// Legacy IE
        ctrl.focus();
        var Sel = document.selection.createRange();
        Sel.moveStart('character', -ctrl.value.length);
        CaretPos = Sel.text.length;
    }

    return (CaretPos);
}


function setCaretPosition(ctrl, pos) {
    if (ctrl.setSelectionRange) {
        ctrl.focus();
        ctrl.setSelectionRange(pos, pos);
    }
    else if (ctrl.createTextRange) {
        var range = ctrl.createTextRange();
        range.collapse(true);
        range.moveEnd('character', pos);
        range.moveStart('character', pos);
        range.select();
    }
}

String.prototype.insert = function (index, string) {
    if (index > 0)
        return this.substring(0, index) + string + this.substring(index, this.length);
    else
        return string + this;
};

function Core_InitContiueModal() {
    $('.evBtnContinue').on('click', function () {
        if (elemContinue != undefined && elemContinue != null) {
            Core_FormAwaiter('start', '.MainFormLoad');
            $('.ladda-button-submit-modal').ladda().ladda('start');
            var arr = [];
            $(".evValidate ._modal-form-result .func-modal-field .evInput").each(function () {
                if ($(this).attr('name') != undefined) {

                    var str = $(this).val();
                    var n = str.indexOf("]");
                    var s = str.indexOf("[");
                    var val;
                    if (s != - 1 || n != -1)
                        val = str.substring(s + 1, n);
                    else
                        val = str;

                    arr.push({
                        key: $(this).attr('name'),
                        value: val
                    })
                };
            });
            $(".evValidate ._modal-form-result .func-modal-field .sel2").each(function () {
                if ($(this).attr('name') != undefined) {
                    arr.push({
                        key: $(this).attr('name'),
                        value: $(this).val()
                    })
                };
            });
            var searchIDs = $("input[class='check']:checkbox:checked").map(function () {
                return $(this).data('recordid');
            }).get();
            if (searchIDs.length > 0) {
                arr.push({ key: "CHECKBOXES", value: searchIDs.toString() });
            }
            get_ajax('post', $(elemContinue).data('url'), {
                buttonid: $(elemContinue).data('functype'),
                tableid: $(elemContinue).data('tableid'),
                dimid: $(elemContinue).data('dimensionid'),
                recordid: $(elemContinue).data('id'),
                position: $(elemContinue).data('position'),
                absoluteid: $(elemContinue).data('absoluteid'),
                classname: $(elemContinue).data('classname'),
                parentlinkid: $(elemContinue).data('parentlinkid'),
                auxsrc: arr
            }, function (data) {
                Core_FormAwaiter('stop', '.MainFormLoad');
                $('.ladda-button-submit-modal').ladda().ladda('stop');
                $('.close').click();
                $('.btn-close').click();
            }
                , null)
        };
    });

    $('.evBtnCancelContinue').on('click', function () {
        $('.close').click();
        $('.btn-close').click();
    });

};



function Core_InitPrintModal() {
    initIChecks('square-blue');
    var PrintChecked = $('.iCheck-helper').parent().parent();
    var PrintCheckLabel = $('.iCheck-helper');
    $(PrintChecked).add(PrintCheckLabel).on('click', function () {

        if ($(this).hasClass('hover') && !$(this).parent().parent().hasClass('additionalCheckswrapper')) {
            if ($(this).find('.icheckbox_square-blue').hasClass('checked') && $(this).find('.icheckbox_square-blue').find('input').val() == '611') {
                $('.additionalCheckswrapper').css('display', 'table');
            }
            else if (!$(this).find('.icheckbox_square-blue').hasClass('checked') && $(this).find('.icheckbox_square-blue').find('input').val() == '611') {
                $('.additionalCheckswrapper').css('display', 'none');
                var itemsList = $('.additionalCheckswrapper').find('.icheckbox_square-blue');
                for (i = 0; i < itemsList.length; i++) {
                    $(itemsList[i]).removeClass('checked');
                }
            }
        }
        else if (!$(this).parent().parent().parent().parent().hasClass('additionalCheckswrapper') && !$(this).parent().parent().hasClass('additionalCheckswrapper')) {
            var temp = $(this).parent();
            if ($(temp).hasClass('checked') && $(temp).find('input').val() == '611') {
                $('.additionalCheckswrapper').css('display', 'table');
            }
            else if (!$(temp).hasClass('checked') && $(temp).find('input').val() == '611') {
                var itemsList = $('.additionalCheckswrapper').find('.icheckbox_square-blue');
                for (i = 0; i < itemsList.length; i++) {
                    $(itemsList[i]).removeClass('checked');
                }
                $('.additionalCheckswrapper').css('display', 'none');
            }
        }
    });

    $('.i-checks.print-modal > *').on('ifChecked', function (e) {
        if (e.target.value == 3823) {
            $('.print-modal-insured').parent().show();
        }
    });
    $('.i-checks.print-modal > *').on('ifUnchecked', function (e) {
        if (e.target.value == 3823) {
            $('.print-modal-insured').parent().hide();
        }
    });

    $('.btnNext').on('click', function () {
        var info = '';
        var el = null;
        var isMultiple;
        //получаем список выбранных печатных форм
        $('.checkswrapper.print-forms :input').each(function () {
            if ($(this).is(':checked')) {
                info += $(this).val() + ',' + $(this).data('text') + '#';
                el = $(this);
                if ($(el).data('tableid') == '198939') {
                    isMultiple = true;
                }
            }
        });
        if (info == "" && el == null) {
            getNewTost('Печатная форма не выбрана', 'warning');
            return;
        }


        if (info.split(',')[0] == 3823) {
            var departingList = [];
            $('.checkswrapper.departing-list :input').each(function () {
                if ($(this).is(':checked')) {
                    departingList.push($(this).val());
                }
            });
        }
        $('.btnPrint').removeAttr('disabled');
        $('#templatetId').val(info.split(',')[0]);
        $('.modal-content .btnNext').ladda().ladda('start');
        //запрашиваем HTML для рендеринга печатных форм
        
        $.get('/Forms/ShowPrintPage', {
            tableid: el.data('tableid'), reportid: info, id: el.data('recordid'), absoluteid: el.data('absoluteid'), isMultiple: isMultiple, departing: JSON.stringify(departingList)
        }, function (data) {

            if (data.indexOf('SetErrorText') >= 0) {
                $('.btnNext').css('display', 'none');
                $('.modal-content .btnNext').ladda().ladda('stop');
                $('.btnBack').removeAttr('disabled');
            } else {
                $('.btnNext').css('display', 'none');
                $('.checkswrapper').css('display', 'none');
                $('.modal-content .btnNext').ladda().ladda('stop');
                $('.fastreportwrapper').replaceWith("<div class='fastreportwrapper'>" + data + "</div>")
                setTimeout(function () { $('.btnBack').removeAttr('disabled'); }, 3000);
            }
        });
    });

    $('.btnBack').on('click', function () {
        $('.btnBack').attr('disabled', true);
        $('.checkswrapper').css('display', '');
        $('.additionalCheckswrapper').css('display', 'none');
        $('.fastreportwrapper').css('display', 'none');
        $('.btnPrint').attr('disabled', true);
        $('.btnNext').css('display', '');
    });

    $('.btnPrint').on('click', function () {

    });
}

function Core_HandleExceptionError(message, alerttype) {


    getNewTost(message, alerttype);

    $('.my-content-container').removeAttr('style');
    ClearFormBlock();

    var a = $('.ladda-button').ladda();
    a.ladda('stop');
    Core_SetUpFormButtons('');
    //$('.tree_errorlabel').text(err);
    $('.tree-elementawait').hide();



}

function Core_HandleStringExceptionError(message) {
    if (message.indexOf('.$.') >= 0) {
        message = message.replace('.$.', '');
        var isAlert = message.indexOf('id') >= 0;
        getNewTost(message, isAlert ? 'error' : 'warning');
        return false;
    }
    return true;
}

function Core_GetLookupClassByBorderDiv(eborderdiv) {
    return eborderdiv.find('.lookup_search').parent().parent().attr('class').split(' ')[0];
}

function Core_CompleteOutField(fieldid, tableid, recid, recidhint) {
    $('.newValidateModal.t' + tableid).parent().find('.close').click();
    $('.newValidateModal.t' + tableid).parent().find('.btn-close').click();

    var eborderdiv = $('.fieldBorderDiv.div_' + fieldid);
    var tableid = eborderdiv.parent().parent().data('tableid');
    if (eborderdiv.find('.lookup_search').length > 0) {
        //scripts.js
        EvaluateVal(recid, recidhint, Core_GetLookupClassByBorderDiv(eborderdiv));

        var el = eborderdiv.find('.lookup_search');
        el.parent().children('.btn-group').children('.evBtnCancel').removeAttr('disabled');
        if (el.data('evoldvall') == el.val()) {
            el.parent().children('.btn-group').children('.evBtnCancel').attr('disabled', true);
        }
        var divClass = '.newValidateModal.t' + tableid;
        if ($('.newValidate.t' + tableid).length > 0) divClass = '.newValidate.t' + tableid;
        Core_SetUpFormButtons(divClass);
    }
}


function CORE_InitDataTableExternalVisible() {
    //  инициализируем начальную видимость полей, зависящих от полей вне текущей модальной формы

    $('th[data-ishidden=0]').each(function () {
        if ($(this).attr('id') != '' && $(this).attr('id') != undefined) {
            var visTMfield = $('.visibleTMs.' + $(this).attr('id'));
            if (visTMfield.children().length > 0) {

                Core_DoVisibleExternalInfluence($(this), '.dataTable');
            }
            toastr.clear($toastlast);

        }
    });
}

function CORE_CompleteTableAsField(tableid, dimensionid, pvisfldvalue, parentlinkid, definition,absoluteid) {
    var curdef = "";     
var tableasfieldid =      "#TABLEASFIELD_" + tableid + "_" + dimensionid + "_" + parentlinkid + "_" + absoluteid;
    if ($(tableasfieldid).length > 0) {
        curdef = $(tableasfieldid).val();
    }

         var contentTableAsFieldId =  '.tableasfield-' + tableid + "-" + dimensionid + '-0-' + parentlinkid + '-' + absoluteid;

    $.get(
        '/Forms/GetTableData_',
        {
            type: "post",
            tableid: tableid,
            pvisfldvalue: pvisfldvalue,
            dimid: dimensionid,
            parentfieldid: 0,
            forView: false,
            externaltms: $(contentTableAsFieldId).data('externaltms'),
            parentlinkid: parentlinkid,
            definition: definition,
            curdefinition: '',
            absoluteid: absoluteid,
            tableasfield: '-1'

        },
        function (response, status) {

            if ($(contentTableAsFieldId).find('#content').html().length > 0) {

                var r = response.substr(response.indexOf("<tbody><tr"), response.indexOf("</tr></tbody>") - response.indexOf("<tbody><tr")).replace("<tbody>", "").replace("</tbody>", "");

                var h = $(contentTableAsFieldId).find('#content').html();

                $(contentTableAsFieldId).find('#content').html(h.replace("</tbody>", r + "</tbody"));
                var valindex = response.indexOf("value=", response.indexOf("</tbody>"));
                var newid = response.substr(valindex + 6, response.indexOf("/", valindex) - (valindex + 6) - 1);

                //не добавляем в набор идентификаторов то, что уже есть в этом наборе
                if ($(tableasfieldid).val() != undefined) {
                    if ($(tableasfieldid).val().indexOf(newid) >= 0) {
                    } else {
                        $(tableasfieldid).val(curdef + (curdef.length > 0 ? ',' : '') + newid);
                    }
                } else {
                    $(tableasfieldid).val(curdef + (curdef.length > 0 ? ',' : '') + newid);
                }

              //  $(contentTableAsFieldId).find('#content').find('.row').remove();// find('table').parent().parent().children('.row').remove();
                var count = $('tr[data-rowid=' + newid + ']').length;

                //если произошло редактирование строки, то уже существующую нужно удалить, а информацию о строках перенести
                if (count > 1) {
                    var l = 0;
                    $('tr[data-rowid=' + newid + ']').each(function () {
                        l += 1;
                        if (l == count) {
                            $(this).append($(tableasfieldid));
                        }
                    });
                    l = 0;
                    $('tr[data-rowid=' + newid + ']').each(function () {
                        l += 1;
                        if (l != count) {
                            $(this).remove();
                        }
                    });
                }

            } else {
                $(contentTableAsFieldId).find('#content').html(response);
            }



            InitTableAsFieldDel();
            InitDelAttachment();
            //нужно только для статически строящихся форм, в частности для вложений
            InitModals(Core_AfterModalRender);
            initNavTabs(false);
            CompleteUpdateMainAttach();
            //Инициализация таблицы без возможностей печати результатов
            InitMyTbl('_dataTable', null, null, 50);
            $('.tblawaiter').addClass('dspn');
            $('.close').click();
            $('.btn-close').click();

            $(".evBtnUpdateAll").removeAttr('disabled');
            CORE_InitDataTableExternalVisible();


        });


}


function ShowSwalBoxNotEqualYear(title, mes) {
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
            let agreeid = getURLParameter('id');

            $.ajax({
                url: "/Forms/UpdateNotEqualYear",
                data: {
                    agreeid: agreeid
                },
                success: function (d, t, x) {
                    $('.confirm').ladda().ladda('stop');
                    if (d == 'OK') {
                        $('.cancel').click();
                        $('.ladda-button-1').click();
                    }
                    else {
                        getNewTost('Внутренняя ошибка сервера.', 'warning');
                    }
                }
            });
        });
};

//Инициализация удаления аттачмента в динамике
function InitDelAttachment() {
    $('.lnk-attachment-del').off('click');
    $('.lnk-attachment-del').on('click', function (e) {
        var el = $(this);
        e.preventDefault();
        var data = el.data();
        swal({
            title: "Вы уверены?", text: "Вы не сможете восстановить вложение после удаления!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#004F91",
            confirmButtonText: "Да, удалить вложение!",
            closeOnConfirm: false,
            cancelButtonText: "Отмена!"
        }, function () {
            $.ajax({
                type: "POST",
                url: data.url,
                data: data,
                success: function (d, t, x) {
                    // if (d > 0) {
                    //   swal("Вложение удалено!", "", "success");
                    // InitPage();
                    // } else {
                    //     getNewTost("Ошибка: " + d, "error");
                    // }
                }
            });
        });
    });

    $('.EDSBtn').off('click');
    $('.EDSBtn').on('click', function () {
        var attachid = $(this).data('attachid');
        $.get('/Files/GetFileBase64', { attachid: attachid }, function (data) {
            $('.edsinput').val();
            $('#base64ToSign').val(data);
            $('#curattachid').val(attachid);
            InitNCALayer();

            createEDSCall();
        });

    });

    $('.SendToSignBtn').off('click');
    $('.SendToSignBtn').on('click', function () {
        var attachid = $(this).data('attachid');
        $.get('/Files/SendToSign', { attachid: attachid }, function (d) {
            if (d > 0) {
                swal("Документ отправлен на подпись!", "", "success");
                location.reload();
            } else {
                getNewTost("Ошибка: " + d, "error");
            }
        });

    });
    

    $('.EDSBtnGroup').off('click');
    $('.EDSBtnGroup').on('click', function () {


        var el = $(this);
      //  e.preventDefault();
        var data = el.data();
        // эта канитель нужна, чтобы понять, пытаемся ли мы удалить группу записей одним махом, 
        // и если да - формируем массив id записей и заполняем соответствующие переменные
        var unique_field = "[data-unique_field='" + data.tableid + "-" + 0 + "-" + 0 + "']";

        var searchIDs = $("input[class='check']" + unique_field + ":checkbox:checked").map(function () {
            return $(this).data('recordid');
        }).get(); // <----
       /* if (searchIDs.length > 0 ) {
            el.data("elements2action", searchIDs);
            data = el.data();
        }*/
        if (searchIDs.length <= 0) {
            getNewTost("Вы не отметили ни одной записи для подписи.", "warning");
            return false;
        }


        var attachsid = searchIDs.join(','); // $(this).data('attachid');
        $.get('/Files/GetFileBase64Multi', { attachsid: attachsid }, function (data) {
            $('.edsinput').val();
            $('#base64ToSign').val(data);
            $('#curattachid').val(attachsid);
            InitNCALayer();

            createEDSCall();
        });

    });

}

//Инициализация загрузки файла
function InitFileUpload() {
    $(document).on('change', '.btn-file :file', function () {
        var input = $(this),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label]).trigger('input');
    });

    $(document).ready(function () {
        $('.btn-file :file').on('fileselect', function (event, numFiles, label) {
            var input = $(this).parents('.ev-input-group').find(':text'),
                log = numFiles > 1 ? 'Выбрано ' + numFiles + ' ' + getFileStr(numFiles) : label;

            if (input.length) {
                input.val(log).trigger('input');
            } else {
                if (log) alert(log);
            }

        });
    });
}

function getFileStr(num) {
    var nn = "" + num;
    var res = "файлов";
    if (nn.length > 0 && nn.length === 1) {
        switch (num) {
            case 1: res = "файл";
                break;
            case 2:
            case 3:
            case 4: res = "файла";
                break;
            default: res = res;
                break;
        }
    } else if (nn.length > 0 && nn.length > 1) {
        var fu = nn.substr(nn.length - 2);
        if (fu.slice(0, 1) !== "1") {
            res = getFileStr(1 * nn.substr(nn.length - 1));
        }
    }
    return res;
}

//Останавливаем кручение ладды по классу
function Scripts_ReinitLadda(cls) {
    $(cls).ladda().ladda('stop');
}

function SetErrorText(err, functype, absoluteid, errtype) {
    var l_errtype = 'error';
    if (errtype != undefined) l_errtype = errtype;
    getNewTost(err.replace('#', ''), l_errtype);
    $('.my-content-container').removeAttr('style');
    ClearFormBlock();
    var a = $('.ladda-button-' + functype).ladda();
    a.ladda('stop');
    //$('.tree_errorlabel').text(err);
    $('.tree-elementawait-' + absoluteid).hide();
}

function SetFormBlock() {
    // делаем недоступными элементы формы при ее сабмите
    $('.newValidate').submit(function () {
        $('.row').css('pointer-events', "none");
        $('.row').css('opacity', 0.5);
    });
}

function SetTreeFormBlock(isBlocked) {

    var div = $('.newValidate').parent().parent().parent();
    if (isBlocked) {
        div.css('pointer-events', 'none');
        div.css('opacity', 0.7);
    } else {
        div.css('pointer-events', '');
        div.css('opacity', 1);
    }
}

function SetWizardFormBlock(isBlocked) {

    if (isBlocked) {
        $('.newValidate div.content').css('pointer-events', 'none');
    } else {
        $('.newValidate div.content').css('pointer-events', '');
    }
}

function ClearFormBlock() {
    $('.row').css('opacity', "").css('pointer-events', "");
    $('.tab-content').css('opacity', "").css('pointer-events', "");
    setSelect2ContainerWidth();
    setTextAreaContainerWidth();
}

function CORE_InitAddHintArea() {
    $('.addArea').off('click');
    $('.addArea').on('click', function () {
        var span = $(this).find('.innerIcon');
        if (span.hasClass('fa-plus')) {
            span.removeClass('fa-plus');
            span.addClass('fa-minus');
            $('#innerDiv' + $(this).data('id')).show();
        } else {
            span.addClass('fa-plus');
            span.removeClass('fa-minus');
            $('#innerDiv' + $(this).data('id')).hide();
        }
        //setSelect2ContainerWidth();
        //setTextAreaContainerWidth();
    });
}

function InitUploadExcel() {
    $('.upload-xls').off('click');
    $('.upload-xls').on('click', function (e) {
        e.preventDefault();

        var clickedButton = $(document.activeElement).attr('name');

        var data;

        data = new FormData();
        data.append('tablename', clickedButton);
        data.append('file', $('#upploadxls')[0].files[0]);
        if ($('.sel2[data-name="mid_company_id"]').length > 0) {
            data.append('companyName', $('.sel2[data-name="mid_company_id"]').val());
        }
        if ($('.sel2[data-name="genid"]').length > 0) {
            data.append('p_genid', $('.sel2[data-name="genid"]').val());
        }
        //  data.append('auxsrc', getAuxsrcArray());
        $('.ladda-button-upload-xls').ladda().ladda('start');
        $.ajax({
            type: "POST",
            url: '/Buttons/UploadExcel',
            data: data,
            processData: false,
            contentType: false,
            success: function (d, t, x) {

                // var param = d.split('#');

                $('#xlsUploadRes').append(d);

                $('.ladda-button-upload-xls').ladda().ladda('stop');

                $("#div_result").html(d);
            },
            error: function (a, b, c) {
                $('.ladda-button-upload-xls').ladda().ladda('stop');
                $('#xlsUploadRes').append('Ошибка при попытке вызова метода загрузки файла. Попробуйте перезайти в систему и повторить операцию.');

            }
        });


        //InitPage();
    });
    
    
    $('input[name=upploadxls]').change(function () {
        //alert($(this).val().split('\\').pop());
        $('input[name=FileDetails]').val($(this).val().split('\\').pop());

    });
}




function InitInfiniteTable() {
    $('#example').DataTable().clear();
    $('#example').DataTable().destroy();
    //   $('#example').empty();
    // getData.offSet = undefined;
    var arr = [[50, 25, 10], [50, 25, 10]];
    let headers = $('#example').find('th');

    // $(document).ready(function () {
    $('#example').DataTable({
        language: {
            "processing": "Подождите...",
            "search": "Поиск: ",
            "lengthMenu": "Показать _MENU_ записей",
            "info": "Записи с _START_ до _END_ из _TOTAL_ записей",
            "infoEmpty": "Записи с 0 до 0 из 0 записей",
            "infoFiltered": "(отфильтровано из _MAX_ записей)",
            "infoPostFix": "",
            "loadingRecords": "Загрузка записей...",
            "zeroRecords": "Записи отсутствуют.",
            "emptyTable:": "В таблице отсутствуют данные",
            "paginate": {
                "first": "<<",
                "previous": "<",
                "next": ">",
                "last": ">>"
            },
            "aria": {
                "sortAscending": ": активировать для сортировки столбца по возрастанию",
                "sortDescending": ": активировать для сортировки столбца по убыванию"
            },
            "emptyTable": "Нет записей в таблице"
        },
        serverSide: true,
        processing: true,
        //   ordering: false,
        // columnDefs: [{ "orderable": false, "targets": 0 }],//отключаем сортировку на первом столбце
        order: [[1, 'asc']],
        searching: false,
        lengthMenu: arr,
        columnDefs: [{ orderable: false, targets: 0 }],
        //   order: [1, "desc"],

        //  bDestroy: true,
        ajax:  /*function (data, callback, settings) {
                var out = [];

                for (var i = data.start, ien = data.start + data.length; i < ien; i++) {
                    out.push([i + '-1', i + '-2', i + '-3', i + '-4', i + '-5']);
                }

                setTimeout(function () {
                    callback({
                        draw: data.draw,
                        data: out,
                        recordsTotal: 5000000,
                        recordsFiltered: 5000000
                    });
                }, 50);
            },*/{
            "url": "/Forms/FormSearchPagination_",
            "type": "POST",
            "data": function (d) {
                try {
                    d.tableid = $('#formtableid').val();
                    d.auxsrc = getAuxsrcArrayNames().join('$$$') + '###' + getAuxsrcArrayValues().join('$$$');
                    d.orderfieldname = $('th[data-colnum=' + d.order[0].column + ']').data('colname');// headers[d.order[0].column].data('colname');
                    d.mnu = getURLParameter("mnu");
                } catch (e) {

                }
            }
        },
        /*   scroller: {
               loadingIndicator: true//,
               // trace: true
           },
           //   deferRender: true,
           //   dom: "rtiS",
           */
        //   scrollY: 800,
        scrollX: true,
        fnDrawCallback: function () {
            InitLocalDel("InitPage");
            InitDelAttachment();
            InitModals(Core_AfterModalRender);
            $('.ladda-button-search').ladda('stop');
            $('.ladda-button-search-block').ladda().ladda('stop');
            /* $('#example tr').off('dblclick');
             $('#example tr').on('dblclick', function (event) {
                 $(this).find('.editmenubtn').find('a')[0].click();
             });*/
            $('table th').each(function () {
                if ($(this).hasClass('sorting_asc') && $(this).hasClass('sorting_disabled')) $(this).removeClass('sorting_asc'); // убираем вдруг появляющуюся сортировку
            });
        },
        footerCallback: function (row, data, start, end, display) {

            /*  $('table th').each(function () {
                  if ($(this).hasClass('sorting_asc') && $(this).hasClass('sorting_disabled')) $(this).removeClass('sorting_asc'); // убираем вдруг появляющуюся сортировку
              });*/
            /*
            var api = this.api();

            // Remove the formatting to get integer data for summation
            var intVal = function (i) {
                return typeof i === 'string' ? i.replace(/[\$,]/g, '') * 1 : typeof i === 'number' ? i : 0;
            };

            // Total over all pages
            total = 100;

            // Total over this page
            pageTotal = 50; var a = "";
            if (data.length > 0) {
                var str = "<span data-agr='";
                var a = data[0][0].substring(data[0][0].indexOf(str) + str.length, data[0][0].indexOf("'></span", data[0][0].indexOf(str)));
                var agrs = a.split('###')

                //$('#example .agrvalues').data('agrvalues');
                $('table[aria-describedby="example_info"] th').each(function () {
                    if ($(this).hasClass('sorting_asc')) $(this).removeClass('sorting_asc'); // убираем вдруг появляющуюся сортировку
                    if ($(this).data("ismoneyformat") == 'True') {
                        var m = 0;
                        for (var i = 0; i < agrs.length - 1; i++) {
                            var b = agrs[i].split('$$$');
                            if (b[0] == $(this).data("colname")) {
                                m = b[1];
                            }
                        }

                        $(api.column($(this).data("colnum")).footer()).html('$' + m + '');
                    }
                });
            }
            if (a == "")
                $('table[aria-describedby="example_info"] tfoot').hide();
                */
            // Update footer

        },
    });


    //   });
}



$(function () {
    PreInitPage($('.formtype').val(), $(".formtableid").val());
});

//формируем словарь для значений полей поиска
function getAuxsrcArray() {
    var arr = [];
    $(".auxsrc").each(function () {
        var val = $(this).val();
        if ($(this).hasClass('sel2')) {
            if ($(this).data('multiple') === 'multiple') {
                val = $(this).val().join(",");
            }
        }
        if ($(this).attr('name') != '') {
            arr.push({
                key: $(this).attr('name'),
                value: val
            })
        }
    });
    return arr;
}

function getAuxsrcArraySF(searchformid) {
    var arr = [];
    $("[data-searchformid="+searchformid+"] .auxsrc").each(function () {
        var val = $(this).val();
        if ($(this).hasClass('sel2')) {
            if ($(this).data('multiple') === 'multiple') {
                val = $(this).val().join(",");
            }
        }
        if ($(this).attr('name') != '') {
            arr.push({
                key: $(this).attr('name'),
                value: val
            })
        }
    });
    return arr;
}

function getAuxsrcArrayNames() {
    var arr = [];
    $(".auxsrc").each(function () {
        var val = $(this).val();
        if ($(this).hasClass('sel2')) {
            if ($(this).data('multiple') === 'multiple') {
                val = $(this).val().join(",");
            }
        }
        if ($(this).attr('name') != '') {
          //  var arr1 = [];
          //  arr1.push($(this).attr('name'));
          //  arr1.push(val);
            arr.push($(this).attr('name'));
        }
    });
    return arr;
}
function getAuxsrcArrayValues() {
    var arr = [];
    $(".auxsrc").each(function () {
        var val = $(this).val();
        if ($(this).hasClass('sel2')) {
            if ($(this).data('multiple') === 'multiple') {
                val = $(this).val().join(",");
            }
        }
        if ($(this).attr('name') != '') {
            //  var arr1 = [];
            //  arr1.push($(this).attr('name'));
            //  arr1.push(val);
            arr.push(val);
        }
    });
    return arr;
}

function PreInitPage(formtype, formtable) {
    // цепляем иконку чекера в заголовок формы
    if ($("#TABLE_WARNING_STATE").val() == "True")
        $("#checker_icon").addClass("ti ti-alert-triangle ch-warning");
    else $("#checker_icon").addClass("ti ti-circle-check ch-ok");

   

    var type = formtype;
    if (type == 4) //иерархическое представление
    {
        loadIerarhViewPartial('div', '0', $('#STRUCTDATE').length > 0 ? $('#STRUCTDATE').val() : "", "/Forms/GetIerarhViewData_", formtable);

        $('.slimScroll').slimScroll({
            height: '720px',
            color: '#004F91'
            //alwaysVisible: true
        });

        InitFilters('1');
        $('[data-searchformid=1] .go-search').on('click', function (e) {
            e.preventDefault();
            $('.ladda-button-search').ladda('start');
            $.ajax({
                type: "POST",
                url: '/Forms/IerarhViewSearchString_',
                data: { tableid: formtable, auxsrc: getAuxsrcArray(), param: $('#STRUCTDATE').length > 0 ? $('#STRUCTDATE').val() : "" },
                success: function (d, t, x) {
                    if (d !== "") {
                        if (d.indexOf('ID сообщения') > 0) {
                            getNewTost(d, "error");
                            $('.ladda-button-search').ladda('stop');
                        }
                        else {                        //записываем результаты поиска во внешнее поле
                            var inp = $('.searchcortege');
                            inp.val(d);
                            inp.data('currentid', d.split(',').length - 1);

                            //начинаем синхронное открытие для тех строк, которые уже отрисованы
                            var mas = d.split(',');
                            for (var i = mas.length; i > 0; i--) {
                                OpenTreeBrunch(mas[i], formtable);
                            }
                        }
                    }
                    else {
                        getNewTost("Ошибка поиска", "error");
                        $('.ladda-button-search').ladda('stop');
                    }

                }
            });


        });

        $('.go-setstruct').off('click');
        $('.go-setstruct').on('click', function () {
            $('.ladda-button-setstruct').ladda().ladda('start');
            loadIerarhViewPartial('ol', '0', $('#STRUCTDATE').length > 0 ? $('#STRUCTDATE').val() : "", "/Forms/GetIerarhViewData_", formtable);
            double_record_array = '';
        })

        //оживляем кнопку Установить должность

        $('.go-setstuff').on('click', function () {
            $('.ladda-button-setstuff').ladda().ladda('start');
            loadIerarhViewPartial('ol', '0', $('#STUFFID').length > 0 ? $('#STUFFID').val() : "", "/Forms/GetIerarhViewData_", formtable);
            double_record_array = '';
        })

        //оживляем кнопку Обновить доступ
        $('.go-updateaccess').on('click', function () {
            $('.ladda-button-updateaccess').ladda().ladda('start');

            var str = "";
            //берем элементы, что есть в базе, но скрыты сейчас и текущие звёзды
            $("i.elemaccess.fromdb.ti-star").add("i.elemaccess.fromdb.ti-star-half").add("i.elemaccess.ti-star-filled").each(function () {
                str += getUpdateAccessString($(this));
            });

            //производим запись в базу
            $.get('/Forms/UpdateStuffAccess_', { stuffid: $('#STUFFID').val(), str: str }, function (data) {
                $('.ladda-button-updateaccess').ladda().ladda('stop');
                if (data.indexOf(':') > 0) {
                    getNewTost(data, "error");
                } else {
                    getNewTost("Права доступа обновлены!", "success");
                    $('.go-setstuff').click();
                }
            })
        });


        $('.col-md-8').css("width", "100%");
        $('.col-md-4.col-sm-12').hide();

    }
    else {
        //если не отображен Checker
        if ($('.dimensionid').length > 0) {
            Scripts_InitSearchForm();
        }

        var searchformid = '1';
        if ($('.Records_' + searchformid).length == 0) {
             InitInfiniteTable();// Нужна там где используется форма поиска. Иначе не будет сразу загрузки
        } 
    }

    Core_InitInputs('');

    $('.searchfilterbtn').on('click', function (e) {
        e.preventDefault();
//        $('input[type="search"]').val($(this).data('searchval')).click();
        $('.dataTable').DataTable().search($(this).data('searchval')).draw();
    });

    InitUploadExcel();

}


//получаем строку обновления элементов доступа
function getUpdateAccessString(elem) {
    var str = "";
    //если имеем дело с установленным СВЕТОМ
    if (!elem.hasClass('fromdb') && elem.hasClass('ti-star-filled')) {
        //обновляем, если в базе уже есть запись для айди элемента, иначе вставляем
        str += elem.data('parentid') + "," + elem.data('type') + "," + ($("i.elemaccess[data-parentid='" + elem.data('parentid') + "'].fromdb").length > 0 ? 2 : 1) + "#";
    }

    //если было в базе и теперь нет СВЕТА, или наследует СВЕТ элемент помеченный ИЗ БАЗЫ, то нужно удалить запись для этого элемента
    if ((elem.hasClass('ti-star') || elem.hasClass('ti-star-half'))
        && elem.hasClass('fromdb')
        && !$("i.elemaccess[data-parentid='" + elem.data('parentid') + "'].ti-star-filled").length > 0
    ) {
        str += elem.data('parentid') + ",0,3#";
    }
    return str;
}

function InitPage(element, clickedobject) {

    var display_conditions = {};
    display_conditions.last10records = false;
    display_conditions.showAll = false;
    display_conditions.last10added = false;
    display_conditions.myapprovals = false;
    if ($('.dimensionid').length > 0 || $('.lefttable_').length > 0) {
        // блок управления кнопками "показать все, 10 посл., 10 добавленн." для корректного отображения нужного раздела при поиске\вставке\ред. записи
        try {
            if ($('#display_conditions').data("conditions") != 0 && element != undefined) {
                display_conditions = $('#display_conditions').data("conditions");
            }

            if (typeof element === "object") {
                display_conditions.showAll = element.attr('class').indexOf('go-showall-search') >= 0;
                display_conditions.last10records = element.attr('class').indexOf('go-last10-search') >= 0;
                display_conditions.last10added = element.attr('class').indexOf('go-10added-search') >= 0;
                display_conditions.myApprovals = element.attr('class').indexOf('go-my-approvals') >= 0;
                $('#display_conditions').data("conditions", display_conditions);
            } else {

                if (element == 'insert') display_conditions.last10added = true;
                if (element == 'update') {
                    display_conditions = $('#display_conditions').data("conditions");
                }
                if (element == 'search') display_conditions = '';

                $('.ladda-button-search').ladda().ladda('start');
            }

            $('#display_conditions').data("conditions", display_conditions);
        }
        catch (e) {
            display_conditions.last10records = false;
            display_conditions.showAll = false;
            display_conditions.last10added = false;
            display_conditions.myApprovals = false;
        }

        if ($('.lefttable_').length > 0) {
            display_conditions.last10records = false;
            display_conditions.showAll = false;
            display_conditions.last10added = false;
            display_conditions.myApprovals = false;
            $('.lefttable_').load(
                '/Forms/FormSearch_',
                {
                    auxsrc: getAuxsrcArray(),
                    tableid: $(".formtableid").val(),
                    dimid: $(".dimensionid").val(),
                    mnu: 1,
                    last10records: display_conditions.last10records,
                    showAll: display_conditions.showAll,
                    last10added: display_conditions.last10added,
                    myApprovals: display_conditions.myApprovals
                },
                function (response, status) {
                    CheckResponse(status);
                    //Инициализация таблицы без возможностей печати результатов

                    InitMyTbl('_dataTable', null, null, 200);

                    //   InitModals(Core_AfterModalRender);
                    // $('.ladda-button-search').ladda('stop');
                    //    $('.ladda-button-search-block').ladda().ladda('stop');

                    $('.righttable_').load(
                        '/Forms/FormSearch_',
                        {
                            auxsrc: getAuxsrcArray(),
                            tableid: $(".formtableid").val(),
                            dimid: $(".dimensionid").val(),
                            mnu: 2,
                            last10records: display_conditions.last10records,
                            showAll: display_conditions.showAll,
                            last10added: display_conditions.last10added,
                            myApprovals: display_conditions.myApprovals
                        },
                        function (response, status) {
                            CheckResponse(status);
                            //Инициализация таблицы без возможностей печати результатов
                            InitMyTbl('_dataTable', null, null, 200);
                            //  InitModals(Core_AfterModalRender);
                            $('.ladda-button-search').ladda('stop');
                            $('.ladda-button-search-block').ladda().ladda('stop');

                        }
                    );

                }
            );

        }
        var searchformid = '1';

        if (clickedobject != undefined) {
            searchformid = clickedobject.data('searchformid') == undefined || clickedobject == null ? '1' : clickedobject.data('searchformid');
        }

        if ($('.lefttable_').length === 0) {
            var infofield = $(".dimensionid[data-searchformid=" + searchformid + "]");

            $('.bottomratings').remove();
            $('.bottomratingsUsers').remove();

            if ($('.Records_' + searchformid).length > 0) {
                $('.Records_' + searchformid).load(
                    '/Forms/FormSearch_',
                    {
                        auxsrc: getAuxsrcArraySF(searchformid),
                        tableid: infofield.data('tableid'),
                        dimid: infofield.val(),
                        searchformid: searchformid,
                        mnu: getURLParameter("mnu"),
                        last10records: display_conditions.last10records,
                        showAll: display_conditions.showAll,
                        last10added: display_conditions.last10added,
                        myApprovals: display_conditions.myApprovals,
                        ischart: $('.Records_' + searchformid).hasClass('ChartHere')
                    },
                    function (response, status) {
                        CheckResponse(status);
                        if (status == 'error') { $('.Records_' + searchformid).replaceWith('<div class="Records_' + searchformid + '">' + response + '</div>'); }
                        if ($('.bottomratings').length > 0) {

                            $('.bottomratingsUsers').appendTo($('.Records_1').parent());
                            $('.bottomratings').appendTo($('.Records_1').parent());
                        }

                        //Инициализация таблицы без возможностей печати результатов
                        InitModals(Core_AfterModalRender);
                        InitMyTbl('_dataTable', 2, null, 50);


                        //Событие на прокрутку _dataTable, запоминаем позицию в scroll_position
                        $('.dvtabcontent').on('scroll', function () {
                            $('#scroll_position').val($('.dvtabcontent').scrollLeft());
                        });

                        $('.dvtabcontent').scrollLeft($('#scroll_position').val());

                        // InitDel заменил на InitLocalDel, т.к. это одно и то же, но у InitDel есть параметр, с которым она нигде не вызывается
                        //InitDel();
                        InitLocalDel("InitPage");
                        InitDelAttachment();
                    
                        $('.ladda-button-search').ladda('stop');
                        $('.ladda-button-search-block').ladda().ladda('stop');

                        CORE_InitAddHintArea();

                     /*   $('.addArea').on('click', function () {
                            var span = $(this).find('.innerIcon');
                            if (span.hasClass('ti-plus')) {
                                span.removeClass('ti-plus');
                                span.addClass('ti-minus');
                                $('#innerDiv'+$(this).data('id')).show();
                            } else {
                                span.addClass('ti-plus');
                                span.removeClass('ti-minus');
                                $('#innerDiv' + $(this).data('id')).hide();
                            }
                            //setSelect2ContainerWidth();
                            //setTextAreaContainerWidth();
                        });*/
                        /* ReinitLaddaSearch();
                         if (typeof element === "object") {
                             element.ladda('stop');
                     }*/



                        //  $('.tblawaiter').addClass('dspn');
                        //  $('.Records_').removeClass('dspn');

                        //   $('.dvtabcontent').scrollLeft($('#scroll_position').val());
                    }

                    );
            } else {
                InitInfiniteTable();
            }
        }

    } else {
        InitMyTbl('_checkTable', null, null, 50);
    }

}

function InitMyTbl(tbl, ord, desc, reccount) {

    $('.attach_show_link').off("click");
    $('.attach_show_link').on("click", function () {

        if ($(this).text().indexOf("Развернуть") >= 0) {
            $(this).text("Свернуть");
            $('.attachments_place').css("display", "");
        } else {
            $(this).text("Развернуть (" + $(this).data('count') + ")");
            $('.attachments_place').css("display", "none");
        }
    });

    if (!desc) {
        desc = "desc";
    }
    var arr = [[-1, 50, 25, 10], ["Все", 50, 25, 10]];
    if (typeof reccount !== "undefined") {
        arr = [[reccount, reccount / 2, reccount / 5, -1], [reccount, reccount / 2, reccount / 5, "Все"]];
    }
    $.fn.dataTable.moment(['DD.MM.YYYY','DD.MM.YYYY HH:mm:ss']);
    //
    $('.' + tbl).dataTable({
        "language": {
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
        "lengthMenu": arr,
        "order": [],
        "bDestroy": true,
        "columnDefs": [{ "orderable": false, "targets": 0 }],//отключаем сортировку на первом столбце
        "ordering": ord == 1 ? false : true,
        "fnDrawCallback": function () {
            InitLocalDel("InitPage");
            InitDelAttachment();
            InitModals(Core_AfterModalRender);
        }
    });
    $('[data-toggle="tooltip"]').tooltip();

}

//инициализируем функциональные кнопочки после прорисовки таблицы
$('body').on('click', '.tree-extension-btn', function () { //'.addgroup-btn, .copytodims-btn, .addhint-btn, .copywithchild-btn', function () {

    var IsModalButton = $(this).hasClass('btn-open-modal');
    if (!IsModalButton) {
        $('#page-wrapper').css('pointer-events', 'none').css('opacity', 0.7);
        $('.form-awaiter').css('display', '');
        ExecuteExtensionButton(this);
    }
});


function ExecuteExtensionButton(elem) {
    var url = $(elem).data('url');
    get_ajax('post', $(elem).data('url'), {
        buttonid: $(elem).data('functype'),
        tableid: $(elem).data('tableid'),
        dimid: $(elem).data('dimensionid'),
        recordid: $(elem).data('id'),
        position: $(elem).data('position'),
        absoluteid: $(elem).data('absoluteid'),
        classname: $(elem).data('classname'),
        parentlinkid: $(elem).data('parentlinkid')
    }, function (data) {

        $('.form-awaiter').css('display', 'none');
        $('#page-wrapper').css('pointer-events', '').css('opacity', 1);
    })
};

//Скрипт перезагрузки поисковой формы, если изменено измерение
function Scripts_ReloadSearchForm(t, title, dimfield, searchformid, funcId, funcExeId) {
    Core_FormAwaiter('start', t);

    $('.ibox-content').css('pointer-events', "none");
    $('.ibox-content').css('opacity', 0.7);

    $.ajax(
        {
            url: '/Forms/FormSearchFields_',
            async: false,
            type: 'get',
            data: { tableid: $(".formtableid").val(), treeid: t, mnu: getURLParameter("mnu"), searchformid: searchformid, funcId: funcId, execFuncId: funcExeId }
        }).done(function (data) {

            $('div.btn-group').remove();
            $('div.Records_1').remove();
            $('.form-searchfields[data-searchformid=' + searchformid + ']').replaceWith(data);
            $('.select2-dropdown').hide();
            Scripts_InitSearchForm(searchformid);
            if (typeof dimfield !== "undefined" && dimfield !== null) {
                var newdimfield = $('#' + dimfield.attr('name').replace('_0_' + searchformid, '_' + t + '_' + searchformid));
                Core_DoSelectInfluence(newdimfield, true, false, '');
            } else {
                var s = '';
                var g = t;
                $('[data-searchformid=' + searchformid + '] select').each(function () {
                    if ($(this).data('fieldid') != '239219') {
                        s += (s.length > 0 ? '@' : '') + $(this).data('fieldid') + '#' + $(this).attr('placeholder');
                    }
                });
                var a = s.split('@');
                var sel = $('[data-searchformid=' + searchformid + '] [data-fieldid=239219]');
                var data = '';
                for (var i = 0; i < a.length; i++) {
                    var b = a[i].split('#');
                    data += (data.length > 0 ? ',' : '') + '{id:"' + b[0] + '",text:"' + b[1] + '"}';

                }
                data = '[' + data + ']';
                sel.find('option').remove();
                sel.select2({
                    data: JSON.parse(data), //тут был ивал (data) убираем по требованию СБ
                    placeholder: sel.attr('placeholder'),
                    allowClear: true
                });
            }




            Core_FormAwaiter('stop', t);
            $('.ibox-content').css('pointer-events', '');
            $('.ibox-content').css('opacity', '');
        });

}

//--------------------------------------ИЕРАРХИЧЕСКОЕ ПРЕДСТАВЛЕНИЕ-----------

//разворачивает родителя и отображает добавленную ветку.
function ShowNewRecord(message, parentID, tableID) {
    var parentLi = $(".dd-item[data-id='" + parentID + "'][data-tableid='" + tableID + "']");
    parentLi.find("[data-action='expand']").css('display', 'none');
    parentLi.find("[data-action='collapse']").css('display', '');
    parentLi.find("[data-action='empty']").css('display', 'none');
    var divtype = parentLi.parent().children('.div-row-' + parentID + '-' + tableID).length > 0 ? 'div' : 'ol';
    loadIerarhViewPartial(divtype, parentID, ' ', "/Forms/GetIerarhViewData_", tableID);

    $('.close').click();
    $('.btn-close').click();
    getNewTost(message);

}

function loadIerarhViewPartial(div_or_ol, p_parentid, p_param, url, p_parenttableid, el) {

    if (el != undefined) { //работаем только с окружением кликнутой кнопки открытия
        el.parent().parent().children('.div-row-' + p_parentid + '-' + p_parenttableid).children('.elementawait-' + p_parentid + '-' + p_parenttableid).show();
    } else $('.elementawait-' + p_parentid + '-' + p_parenttableid).show();
    //url = "/Forms/GetIerarhViewData_"
    $.get(url, {
        tableid: p_parenttableid, parentid: p_parentid, param: p_param, mnu: getURLParameter("mnu")
    },
        function (data) {

            var mustInit = true;
            if (el != undefined) { //чтобы инфа не подгружалась в похожие дивы списка (для навигатора)
                $div = el.parent().parent().children('.' + div_or_ol + '-row-' + p_parentid + '-' + p_parenttableid);
            } else $div = $('.' + div_or_ol + '-row-' + p_parentid + '-' + p_parenttableid);
            var currentGrandParent = $div.parent();
            if (data.indexOf('div') == -1) { //если произошла ошибочка видать
                $div.replaceWith("<ol class='dd-list ol-row-" + p_parentid + "-" + p_parenttableid + "' data-olid='" + p_parentid + "'>" + data + "</ol>");
                mustInit = false;
            }
            else {

                $div.replaceWith(data);

            }

            if ($('.ol-row-' + p_parentid + '-' + p_parenttableid).length > 0 && mustInit) {

                $('.ol-row-' + p_parentid + '-' + p_parenttableid).find("[data-action='expand']").off('click');
                $('.ol-row-' + p_parentid + '-' + p_parenttableid).find("[data-action='expand']").on('click', function () {

                    var el = $(this);

                    var id = el.parent().data("id");
                    var tabid = el.parent().data("tableid");

                    var parenttabid = el.parent().data("parenttableid");
                    var expand = true;
                    var MyChildsPole = el.parent().parent().children('.ol-row-' + id + '-' + tabid);
                    var MyChildsPlaceholder = el.parent().parent().children('.div-row-' + id + '-' + tabid);
                    var OverallChildsPole = $('.ol-row-' + id + '-' + tabid);
                    if (url == "/Forms/GetNavigatorData_")
                        OverallChildsPole = $('.ol-row-' + getURLParameter('id') + '-' + getURLParameter('tableid')).find('.ol-row-' + id + '-' + tabid);


                    //если наша разметка существует и не существует уже открытой разметки по дереву
                    if (MyChildsPlaceholder.length > 0 && OverallChildsPole.length == 0) {
                        loadIerarhViewPartial('div', id, p_param == "-1" ? "" : p_param, url, tabid, el);
                        el.parent().find("[data-action='collapse']").css("display", "");
                        el.css("display", "none");

                    } else {

                        var MyClickedLi = MyChildsPole.parent().children('li[data-id="' + id + '"][data-tableid="' + tabid + '"]');
                        var OveralClickedLi = OverallChildsPole.parent().children('li[data-id="' + id + '"][data-tableid="' + tabid + '"]');
                        if (MyChildsPole.length > 0) {

                            if (MyChildsPole.css('display') == 'none') {
                                MyClickedLi.find("[data-action='collapse']").css("display", "");
                                MyClickedLi.find("[data-action='expand']").css("display", "none");
                                MyChildsPole.css('display', '');
                            }

                        } else if (getURLParameter('id')) {
                            // моргаем фоном
                            for (var i = 0; i < 20; i++) {
                                OveralClickedLi.find('div.dd3-content').animate({
                                    backgroundColor: "#c6cbd3"
                                }, 100);
                                OveralClickedLi.find('div.dd3-content').animate({
                                    backgroundColor: "#f5f5f5"
                                }, 100);
                            }
                            ShowTost('Вы уже развернули эту ветку...');
                        }


                    }

                });


                $('.ol-row-' + p_parentid + '-' + p_parenttableid).find("[data-action='collapse']").off('click');
                $('.ol-row-' + p_parentid + '-' + p_parenttableid).find("[data-action='collapse']").on('click', function () {
                    var el = $(this);
                    el.parent().find("[data-action='expand']").css("display", "");
                    el.css("display", "none");

                    var id = el.parent().data("id");
                    var tabid = el.parent().data("tableid");
                    el.parent().parent().find('.ol-row-' + id + '-' + tabid).css("display", "none");

                });

                InitModals(Core_AfterModalRender);

                if (url != "/Forms/GetNavigatorData_")

                    InitTreeElementDel('.ol-row-' + p_parentid + ' - ' + p_parenttableid);
                //если мы находимся в режиме открывания веток при поиске
                if ($('.searchcortege').length > 0) {
                    OpenTreeBrunch($('.searchcortege').val().split(',')[$('.searchcortege').data('currentid')], p_parenttableid);
                }
            }
            else {


                var currentLi = currentGrandParent.children('li[data-id="' + p_parentid + '"][data-tableid="' + p_parenttableid + '"]');
                currentLi.find("[data-action='collapse']").css("display", "none");
                currentLi.find("[data-action='expand']").css("display", "none");
                currentLi.find("[data-action='empty']").css("display", "");
            }


            //при отрисовке новых элементов дерева, нам необходимо произвести обновление прав доступа с учетом текущих изменений клиента
            if ($("i.elemcancel[data-parentid='" + p_parentid + "']").length > 0) {

                //если текущий элемент имеет собственный СВЕТ, то просто обновляем его дочернюю структуру
                if ($("i.elemaccess[data-parentid='" + p_parentid + "'].ti-star-filled").length > 0) {
                    var elem = $("i.elemaccess[data-parentid='" + p_parentid + "'].ti-star-filled");
                    do_inherit(elem, elem.data('type'));
                } else //иначе находим ближайший свет родителя и обновляем его дочернюю структуру
                {
                    find_parent_do_inherit($("i.elemaccess[data-parentid='" + p_parentid + "'][data-type='3']"), false);
                }
            }

            //оживляем кнопку очистки элемента доступа
            $("i.elemcancel[data-grandparentid='" + p_parentid + "']").on('click', function () {
                var elem = $(this);
                //проходимся по всем доступам одного элемента доступа
                $("i.elemaccess[data-parentid='" + elem.data('parentid') + "']").each(function () {
                    var elem1 = $(this);
                    var flag = true;
                    //если элемент имеет звезду, то при её отмене находим ближайшего родителя со светом и производим наследование
                    if (elem1.hasClass('ti-star-filled')) {
                        if (elem1.hasClass('fromdb')) flag = false;
                        elem1.removeClass('ti-star-filled');
                        elem1.addClass('ti-star');
                        if ((!$("i.elemaccess[data-parentid='" + elem.data('parentid') + "'].fromdb").length > 0) || elem1.hasClass('fromdb')) {

                            find_parent_do_inherit(elem, true);
                        }
                    }

                    //если изначально из базы был СВЕТ, то при попытке удалить клиентский свет, сначала восстанавливаем свет из базы
                    if (elem1.hasClass('fromdb') && !elem1.hasClass('ti-star-filled') && flag) {
                        elem1.removeClass('ti-star');
                        elem1.removeClass('ti-star-half');
                        elem1.addClass('ti-star-filled');

                        do_inherit(elem1, elem1.data('type'));
                    }
                });
            });

            //при нажатии на звезду просисходит создание СВЕТА
            $("i.elemaccess[data-grandparentid='" + p_parentid + "']").on('click', function () {
                var elem = $(this);
                //работаем с братьями и самим элементом
                $("i.elemaccess[data-grandparentid='" + elem.data('grandparentid') + "']").each(function () {
                    var elem1 = $(this);
                    //проставляем для не себя уровень доступа СКРЫТО
                    if (elem1.hasClass('ti-star') && elem.data('parentid') != elem1.data('parentid') && elem1.data('type') == 3) {
                        //исключая случай, когда стоит конкретный уровень доступа (ПОЛНАЯ ЗВЕЗДА)
                        if (!$("i.elemaccess[data-parentid='" + elem1.data('parentid') + "'].ti-star-filled").length > 0) {
                            elem1.removeClass('ti-star');
                            elem1.addClass('ti-star-half');
                        }
                    }

                    //убираем наследия на братьях с уровенем отличным от СКРЫТО
                    if (elem1.hasClass('ti-star-half') && elem.data('parentid') != elem1.data('parentid') && elem1.data('type') != 3) {
                        elem1.removeClass('ti-star-half');
                        elem1.addClass('ti-star');
                    }

                    //проставляем ПОЛНУЮ ЗВЕЗДУ на кликнутом элементе, если он уже не имеет ПОЛНУЮ ЗВЕЗДУ
                    if ((elem1.hasClass('ti-star-half') || elem1.hasClass('ti-star')) && elem.data('parentid') == elem1.data('parentid') && elem1.data('type') == elem.data('type')) {
                        elem1.removeClass('ti-star-half');
                        elem1.removeClass('ti-star');
                        elem1.addClass('ti-star-filled');

                        $("i.elemcancel[data-parentid='" + elem1.data('parentid') + "']").addClass('ti-x');
                    }

                    //очищаем другие звёзды текущего элемента
                    if ((elem1.hasClass('ti-star-half') || elem1.hasClass('ti-star-filled')) && elem.data('parentid') == elem1.data('parentid') && elem1.data('type') != elem.data('type')) {
                        elem1.removeClass('ti-star-half');
                        elem1.removeClass('ti-star-filled');
                        elem1.addClass('ti-star');
                    }
                });

                //обновляем дочернюю структуру
                do_inherit(elem, elem.data('type'));
            }
            );

            if (p_parentid == "0") {

                if ($('.ladda-button-setstruct').length > 0) $('.ladda-button-setstruct').ladda().ladda('stop');
                if ($('.ladda-button-setstuff').length > 0) $('.ladda-button-setstuff').ladda().ladda('stop');
            }

            if (data.indexOf('###') > -1) {
                $("#wrapper").data("globalindex", data.substring(data.indexOf('###') + 3, data.indexOf('+++')));
            }

        });
}

//найти ближайшего родителя со СВЕТОМ и распространить его на дочернюю структуру
function find_parent_do_inherit(elem, changeCancelIcon) {
    var p_elem = elem;
    var p_elem_star = null;
    var flag = true;
    var i = 0;

    do {
        //ищем свет предка
        $("i.elemaccess[data-parentid='" + p_elem.data('grandparentid') + "']").each(function () {
            p_elem = $(this);
            if (p_elem.hasClass('ti-star-filled')) {
                flag = false;
                p_elem_star = p_elem;
            }
        });
        i++;
    } while (flag && i < 500);

    //если нужно убрать иконку ОТМЕНЫ при её нажатии
    if (changeCancelIcon) $("i.elemcancel[data-parentid='" + elem.data('parentid') + "']").removeClass('ti-x');

    //если свет предка найден, то наследуем его в дочернюю структуру
    if (p_elem_star != null) {
        do_inherit(p_elem_star, p_elem_star.data('type'));
    } else //иначе наследуем всем невидимость
    {
        if (changeCancelIcon) $("i.elemaccess[data-parentid='" + elem.data('parentid') + "'][data-type='3']").removeClass('ti-star').addClass('ti-star-half');
        do_inherit(p_elem, 3);
    }
}

//распространить указанный СВЕТ на дочернюю структуру
function do_inherit(elem, type) {

    $("i.elemaccess[data-grandparentid='" + elem.data('parentid') + "']").each(function () {
        var elem1 = $(this);

        if (!$("i.elemaccess[data-grandparentid='" + elem.data('parentid') + "'].ti-star-filled").length > 0) {

            if (elem1.data('type') == type && elem1.hasClass('ti-star')) {
                elem1.removeClass('ti-star');
                elem1.addClass('ti-star-half');
                do_inherit(elem1, type);
            }

            if (elem1.data('type') == type && elem1.hasClass('ti-star-half')) {
                do_inherit(elem1, type);
            }

            if (elem1.data('type') != type && elem1.hasClass('ti-star-half')) {
                elem1.removeClass('ti-star-half');
                elem1.addClass('ti-star');
            }

        } else if (elem1.data('type') == 3) {

            if (!$("i.elemaccess[data-parentid='" + elem1.data('parentid') + "'].ti-star-filled").length > 0) {
                elem1.removeClass('ti-star');
                elem1.addClass('ti-star-half');
            }
            do_inherit(elem1, type);
        }
    });

}

//открываем ветку с соответствующим ID
function OpenTreeBrunch(id, formtable) {
    var inp = $('.searchcortege');
    var curtableid = formtable;
    var recordid = $('#recordid').val();
    var li = $('.ol-row-0-' + curtableid).find("[data-id='" + id + "']");
    //если соответствующий элемент уже отрисован
    if (li.length > 0 && inp.data('currentid') > 0) {
        //эмитируем нажатие
        li.find("[data-action='expand']").click();

        //уменьшаем внешний счетчик для следующего открытия
        inp.data('currentid', inp.data('currentid') - 1);
    }
    $('.ladda-button-search').ladda().ladda('stop');

    //прокрутка скролов на позицию найденого поиском элемента
    if ($('.searchcortege').val().split(',')[$('.searchcortege').data('currentid')] == id && inp.data('currentid') == 0) {

        li.find(".dd3-content").css("background", "#c6cbd3");
        li.find("[data-action='expand']").click();

        $('.slimScroll').slimScroll({
            scrollTo: window.innerHeight + (li.find(".dd3-content").length > 0 ? li.find(".dd3-content").offset().top + 300 : 0)
        });

        if ((li.find(".dd3-content").length > 0 ? li.find(".dd3-content").offset().top : 0) + 200 >= window.innerHeight) {
            window.scrollTo(0, (li.find(".dd3-content").offset().top) / 1.7);
        }
    }
}
//--------------------------------------ИЕРАРХИЧЕСКОЕ ПРЕДСТАВЛЕНИЕ-----------


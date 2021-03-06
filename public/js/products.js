/**
 * Created by pi on 9/17/16.
 */
$(function () {
    var productsDataTable = $('#productsTable').DataTable();
    var selected = [];
    var dialog, form,

        // From http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#e-mail-state-%28type=email%29
        emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
        ident = $( "#ident" ),
        email = $( "#email" ),
        password = $( "#password" ),
        $category = $( "#category" ),
        category = -1,
        allFields = $( [] ).add( ident ).add( email ).add( password ),
        tips = $( ".validateTips" );

    function updateTips( t ) {
        tips
            .text( t )
            .addClass( "ui-state-highlight" );
        setTimeout(function() {
            tips.removeClass( "ui-state-highlight", 1500 );
        }, 500 );
    }

    function checkLength( o, n, min, max ) {
        if ( o.val().length > max || o.val().length < min ) {
            o.addClass( "ui-state-error" );
            updateTips( "Length of " + n + " must be between " +
                min + " and " + max + "." );
            return false;
        } else {
            return true;
        }
    }
    
    function checkCategory(c,$c,arr) {
        var index = arr.indexOf(c);
        console.log('index: ' + index);
        if(index>-1){
            return true;
        }else {
            $('#category-button').addClass( "ui-state-error" );
            updateTips( "category " + c + " must in the list.");
            return false;
        }
    }
    function checkRegexp( o, regexp, n ) {
        if ( !( regexp.test( o.val() ) ) ) {
            o.addClass( "ui-state-error" );
            updateTips( n );
            return false;
        } else {
            return true;
        }
    }

    function addProduct() {
        var valid = true;
        allFields.removeClass( "ui-state-error" );

        valid = valid && checkLength( ident, "ident", 3, 16 );

        valid = valid && checkCategory( category,$category,[0,1,5] );

        valid = valid && checkRegexp( ident, /^[a-z]([0-9a-z_\s])+$/i, "Username may consist of a-z, 0-9, underscores, spaces and must begin with a letter." );
       

        if ( valid ) {
            var productInfo = {
                ident: ident.val(),
                category: category
            };
            $.post('/product/productList/createProduct',{productInfo:productInfo}, function (data) {
                var newProduct = null;
                console.log('data: ' + data);
                if (!data.error) {
                    newProduct = data.newProduct;
                    console.log('newProduct: ' + newProduct);
                    console.log('newProduct id: ' + newProduct.id);
                    console.log('newProduct State: ' + newProduct.displayState);
                    var rowNode = productsDataTable.row.add([
                        '<a href="/product/productDetail/:' + newProduct.id + '">' + newProduct.ident + '</a>',
                        newProduct.category,
                        newProduct.displayState
                    ]).draw(false).node();
                    $(rowNode).attr('id', newProduct.id);

                } else {
                    $('#errors').append('<li>' + data.error + '</li>');
                }
                dialog.dialog( "close" );

            });
        }
        return valid;
    }

    dialog = $( "#createNewProductDialog" ).dialog({
        autoOpen: false,
        height: 400,
        width: 350,
        modal: true,
        buttons: {
            "Create an product": addProduct,
            Cancel: function() {
                dialog.dialog( "close" );
            }
        },
        close: function() {
            form[ 0 ].reset();
            allFields.removeClass( "ui-state-error" );
        }
    });

    form = dialog.find( "form" ).on( "submit", function( event ) {
        event.preventDefault();
        addProduct();
    });


    $('#newProduct').click(function () {
        $('#errors').empty();
        dialog.dialog( "open" );
        $('#category')
            .selectmenu({
                change: function (event, ui) {
                    category = ui.item.value;
                    category = parseInt(category);
                }
            });


    });
    $('#productsTable tbody').on('click', 'tr', function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
            selected.pop();
        }
        else {
            productsDataTable.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            console.log('id: ' + this.id);
            selected.pop();
            selected.push(this.id);
            console.log('selected');
            console.dir(selected);

        }
    });
    $('#deleteProduct').click(function () {
        $('#errors').empty();
        $('#infos').empty();
        if (selected.length > 0) {
            var toDeleteProductIdsStr = JSON.stringify(selected);
            console.log('toDeleteProductIdsStr: ' + toDeleteProductIdsStr);
            productsDataTable.row('.selected').remove().draw(false);
            $.post('/product/productList/deleteProduct', {toDeleteProductIdsStr: toDeleteProductIdsStr}, function (data) {
                console.log(data);
                if (data.error) {
                    $('#errors').append('<li>' + data.error + '</li>');
                }
                if (data.info) {
                    $('#infos').append('<li>' + data.info + '</li>');
                }
            });
        } else {
            $('#errors').append('<li>No row selected</li>');
        }

    });

});
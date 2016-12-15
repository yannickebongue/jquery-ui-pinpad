$( function() {
    var version = $.ui.pinpad.version;
    var aside = $( "main" ).find( "aside" );
    var demos = [
        { url: "demos/default.html", title: "Default functionality", description: "<p>The pinpad is tied to a standard form input field. Focus on the input (click, or use the tab key) to open an interactive pin pad in a small overlay.</p>" },
        { url: "demos/autocompletion.html", title: "Autocompletion", description: "<p>Confirm the content of the pinpad input automatically when its value reach the maximum length. Set the <code>autoComplete</code> option to <code>true</code> and set one of <code>maxlength</code> attribute of the pinpad input or <code>maxLength</code> option during pinpad creation.</p>" },
        { url: "demos/content-length-restriction.html", title: "Restrict content length", description: "<p>Restrict the length of the pinpad input content using the <code>minLength</code> and <code>maxLength</code> options.</p>" },
        { url: "demos/custom-command.html", title: "Custom command", description: "<p>Adding a custom command to the pinpad.</p>" },
        { url: "demos/digit-only.html", title: "Digit only", description: "<p>Use the <code>digitOnly</code> option to accept or not the decimal point.</p>" },
        { url: "demos/inline.html", title: "Display inline", description: "<p>Display the pinpad embedded in the page instead of in an overlay. Set the <code>appendTo</code> option during the pinpad creation to indicate where to generate the widget.</p>" },
        { url: "demos/localization.html", title: "Localize pinpad", description: "<p>Localize the pinpad language (Default: english).</p>" }
    ];

    $( "#downloadFrame" ).find( "button" ).button( { icon: "ui-icon-arrowthickstop-1-s", label: "Download jQuery UI Pinpad " + version } ).on( "click", function () {
        location.href = "https://github.com/yannickebongue/jquery-ui-pinpad/archive/" + version + ".zip";
    } );

    $( ".view-source" ).find( "a" ).on( "click", function() {
        $( this ).next().slideToggle();
    } );

    if ( demos.length > 0 ) {
        var list = $( "<ul></ul>" );

        $.each( demos, function( index, demo ) {
            var item = $( "<li><a href='" + demo.url + "'>" + demo.title + "</a></li>" );
            item.addClass( "ui-state-default" );
            item.hover( function() {
                item.toggleClass( "ui-state-hover" );
            } );
            item.find( "a" ).on( "click", function( event ) {
                if ( !item.is( ".ui-state-active" ) ) {
                    $( ".demo-frame" ).one( "load", function() {
                        var frame = this;
                        $.get( this.contentWindow.location.href, function ( data, textStatus, jqXHR ) {
                            $( ".view-source" ).find( "a" ).next().slideUp( function() {
                                $( ".view-source" ).find( "code" ).text( jqXHR.responseText ).each( function( index, block ) {
                                    if ( hljs ) {
                                        hljs.highlightBlock( block );
                                        var text = "";
                                        var lines = block.innerHTML.split( "\n" );
                                        var i;
                                        for ( i = 0; i < lines.length - 1; i++ ) {
                                            text += "<span class='line-number'></span>" + lines[ i ] + "\n";
                                        }
                                        block.innerHTML = text;
                                    }
                                } );
                                $( ".demo-description" ).html( demo.description );
                                item.siblings( ".ui-state-active" ).removeClass( "ui-state-active" );
                                item.addClass( "ui-state-active" );
                            } );
                        });
                    } ).prop( "src", demo.url );
                }
                event.preventDefault();
            } );
            item.appendTo( list );
        } );

        list.appendTo( aside );

        aside.find( "li" ).first().find( "a" ).trigger( $.Event( "click" ) );
    }

} );

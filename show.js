
$(function() {
        var host = window.location.protocol == 'http:' ?
            '' : "http://tiddlyspace.com/";
        var recipe = new tiddlyweb.Recipe('cdent_public', host);
        var local_bag = 'cdent_public';

        var errorTiddler = function(xhr, status, exc) {
            console.log("failure getting stuff", xhr, status, exc);
        };

        // load a tiddler from the remote, and put it 
        // in the story. By default append, but if prepend: true
        // in options, prepend.
        var displayTiddler = function(title, options) {
            var configs = {
                prepend: false,
            }
            if (typeof options === 'undefined')
                options = {};
            $.extend(configs, options);

            var tiddler = new tiddlyweb.Tiddler(title);
            tiddler.recipe = recipe;

            var title = $('<h1>').text(tiddler.title);
            var container = $('<section class="text">');
            var tiddler_div = $('<article class="tiddler">')
                .append(title)
                .append(container);

            if (options.prepend === true) {
                tiddler_div.prependTo('#story');
            } else {
                tiddler_div.appendTo('#story');
            }

            var _display = function(tid) {
                console.log(tid);
                container.append(tid.render);
                var tag_list = $('<ul>');
                for (var i = 0; i < tid.tags.length; i++) {
                    var tag = $('<li>').text(tid.tags[i]);
                    tag_list.append(tag);
                }
                tag_list.appendTo(tiddler_div);
            };

            tiddler.get(_display, errorTiddler, 'render=1');
        };

        // display tiddlers named by the text in the tid
        var loadTiddlers = function(tid) {
            var tiddlers = tid.text.split('\n');
            for (var i = 0; i < tiddlers.length; i++) {
                var tiddler = tiddlers[i];
                tiddler = tiddler.replace(/\]\]$/, '')
                    .replace(/^\[\[/, '');
                displayTiddler(tiddler);
            }
        }

        // load the DefaultTiddlers 
        var getDefaults = function() {
            var tiddler = new tiddlyweb.Tiddler('DefaultTiddlers')
            tiddler.recipe = recipe;
            tiddler.get(loadTiddlers, errorTiddler);
        };

        var setTitle = function() {
            var tiddler = new tiddlyweb.Tiddler('SiteTitle');
            tiddler.recipe = recipe;

            var _setTitle = function(tid) {
                var title = tid.text;
                $('title').text(title);
                $('header').text(title);
            };
            tiddler.get(_setTitle, errorTiddler);
        };

        var refreshRecents = function() {
            console.log('updating global side');
            var search = new tiddlyweb.Search("modifier:cdent _limit:10",
                    host);
            search.get(_displayRecents, errorTiddler);
        };

        var _displayRecents = function(tiddlers) {
            var place = $('.recents');
            place.children().remove();
            for (var i = 0; i < tiddlers.length; i++) {
                var tiddler = tiddlers[i];
                var klass = tiddler.bag.name == local_bag ? 'local' : 'remote';
                var link = $('<a>').attr({
                        'href': tiddler.route(),
                        'class': klass})
                    .text(tiddler.title);
                var item = $('<li>').append(link)
                place.append(item);
            }
        };

        $.ajaxSetup({
            beforeSend: function(xhr) {
                xhr.setRequestHeader("X-ControlView", "false");
            }
        });
        
        // bootstrap via DefaultTiddlers
        $(document).ready(function() {
            setTitle();
            getDefaults();
            refreshRecents();
            setInterval(refreshRecents, 30000);
        });
});

Dali.Plugin = function(descendant){
    var state;
    var id;
    var initialParams;
    var extraFunctions = {};

    var defaultFor = function(arg, value) {
        return typeof arg !== 'undefined' ? arg : value;
    };

    var assignPluginContainerIds = function(json){
        if(json.child){
            for(var i = 0; i < json.child.length; i++){
                assignPluginContainerIds(json.child[i]);
            }
        }
        if(json.tag && json.tag === "plugin"){
            if(!state['pluginContainerIds']){
                state['pluginContainerIds'] = {};
            }
            var key = json.attr['plugin-data-key'];
            if(!key){
                console.error(json.tag + " has not defined plugin-data-key");
            }else{
                if(state['pluginContainerIds'][key]){
                    json.attr['plugin-data-id'] = state['pluginContainerIds'][key];
                }
            }
        }
    }

    var plugin = {
        init: function () {
            Dali.API.addMenuButton(this.getConfig());
            if(descendant.init) {
                descendant.init();
            }
        },
        getConfig: function(){
            var name, category, callback, needsConfigModal, needsTextEdition;
            if(descendant.getConfig){
                name = descendant.getConfig().name;
                category = descendant.getConfig().category;
                icon = descendant.getConfig().icon;
                needsConfigModal = descendant.getConfig().needsConfigModal;
                needsTextEdition = descendant.getConfig().needsTextEdition;
            }

            name = defaultFor(name, 'Plugin name');
            category = defaultFor(category, 'text');
            needsConfigModal = defaultFor(needsConfigModal, false);
            needsTextEdition = defaultFor(needsTextEdition, false);
            icon = defaultFor(icon, 'fa-cogs');

            callback = function (initParams) {
                if (descendant.getInitialState) {
                    state = descendant.getInitialState();
                }
                state = defaultFor(state, {});
                initialParams = initParams;
                // if(needsConfigModal) {
                    // this.openConfigModal(false, state);
                // }else {
                    this.render(false);
                // }
            }.bind(this);

            return {
                name: name,
                category: category,
                callback: callback,
                needsConfigModal: needsConfigModal,
                needsTextEdition: needsTextEdition,
                icon: icon,
            };
        },
        getToolbar: function(){
            var toolbar;
            if(descendant.getToolbar)
                toolbar = descendant.getToolbar();
            toolbar = defaultFor(toolbar, []);

            /*
             name: 'opacity',
             humanName: 'Opacity',
             type: 'number',
             units: 'em',
             value: 1,
             min: 0,
             max: 1,
             step: 0.1,
             autoManaged: true,
             callback: this.changeBorderSize.bind(this),
             isAttribute: true
             */
            for(var i = 0; i < toolbar.length; i++){
                toolbar[i].autoManaged = defaultFor(toolbar[i].autoManaged, true);
                if(!toolbar[i].callback && !toolbar[i].autoManaged) {
                    toolbar[i].callback = this.update.bind(this);
                }
            }
            return toolbar;
        },
        getSections: function(){
            var sections;
            if(descendant.getSections)
                sections = descendant.getSections();
            sections = defaultFor(sections, []);

            return sections;
        },
        openConfigModal: function(isUpdating, oldState, sender){
            state = oldState;
            id = sender;

            if(!descendant.getConfigTemplate) {
                if(this.getConfig().needsConfigModal)
                    console.error(this.getConfig().name + " has not defined getConfigTemplate method");
            }else {
                Dali.API.openConfig(this.getConfig().name, isUpdating).then(function (div) {
                    div.innerHTML = descendant.getConfigTemplate(oldState);
                });
            }
        },
        updateTextChanges: function(text, sender){
            state.text = text;
            id = sender;
            this.render(true);
        },
        render: function(isUpdating){
            if(!descendant.getRenderTemplate){
                console.error(this.getConfig.name + " has not defined getRenderTemplate method");
            } else {
                var jsonTemplate = html2json(descendant.getRenderTemplate(state));
                assignPluginContainerIds(jsonTemplate);
                Dali.API.renderPlugin(
                    jsonTemplate,
                    this.getToolbar(),
                    this.getConfig(),
                    this.getSections(),
                    state,
                    isUpdating,
                    {
                        id: id,
                        parent: initialParams.parent,
                        container: initialParams.container
                    },
                    {
                        position: initialParams.position,
                        row: initialParams.row,
                        col: initialParams.col
                    }
                );
            }
        },
        update: function(oldState, name, value, sender){
            state = oldState;
            id = sender;
            if(descendant.handleToolbar)
                descendant.handleToolbar(name, value);
            this.render(true);
        },
        setState: function(key, value) {
            state[key] = value;
        },
        getState: function(){
            return state;
        },
        registerExtraFunction: function(fn, alias){
            if(!alias){
                Object.keys(descendant).forEach(function(prop) {
                    if(descendant[prop] === fn){
                        alias = prop;
                    }
                });
            }
            extraFunctions[alias] = fn;
        },
        getExtraFunctions: function(){
            return Object.keys(extraFunctions);
        },
        callExtraFunction: function(alias, fnAlias) {
            var element = $.find("[data-alias='" + alias + "']");
            if (element) {
                extraFunctions[fnAlias].bind(element[0])();
            }
        }
    };
    Object.keys(descendant).map(function(id) {
        if(id !== 'init' &&
            id !== 'getConfig' &&
            id !== 'getToolbar' &&
            id !== 'getSections' &&
            id !== 'getInitialState' &&
            id !== 'handleToolbar' &&
            id !== 'getConfigTemplate' &&
            id !== 'getRenderTemplate'){
            plugin[id] = descendant[id];
        }
    });

    return plugin;
};
import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {ActionCreators} from 'redux-undo';
import {Grid, Col, Row, Button, OverlayTrigger, Popover} from 'react-bootstrap';
import {addNavItem, selectNavItem, expandNavItem, removeNavItem, reorderNavItem,
    addBox, selectBox, moveBox, resizeBox, updateBox, deleteBox, reorderBox, dropBox, increaseBoxLevel,
    addSortableContainer, resizeSortableContainer, changeCols, changeRows,
    togglePageModal, toggleTextEditor, toggleTitleMode,
    changeDisplayMode, exportStateAsync, importStateAsync, updateToolbar, collapseToolbar} from '../actions';
import {ID_PREFIX_BOX, ID_PREFIX_SORTABLE_BOX, ID_PREFIX_SORTABLE_CONTAINER, BOX_TYPES} from '../constants';
import DaliCanvas from '../components/DaliCanvas';
import DaliCarousel from '../components/DaliCarousel';
import PageModal from '../components/PageModal';
import PluginConfigModal from '../components/PluginConfigModal';
import PluginToolbar from '../components/PluginToolbar';
import Visor from '../components/visor/Visor';
import PluginRibbon from '../components/PluginRibbon';
import DaliNavBar from '../components/DaliNavBar';
require('../sass/style.scss');

class DaliApp extends Component{
      constructor(props) {
        super(props);
        this.state = {
            pluginTab: 'all',
            hideTab:'hide',
            visor:false
        };
    }
    render(){
        const{ dispatch, boxes, boxesIds, boxSelected, boxLevelSelected, navItemsIds, navItems, navItemSelected,
            pageModalToggled, undoDisabled, redoDisabled, displayMode, isBusy, toolbars } = this.props;
            var margenplugins = this.state.hideTab=='hide'?1:0
            var paddings= (navItems[navItemSelected].type!= "slide") ? (99-60*margenplugins+'px 0px 0px 0px') : (130-60*margenplugins+'px 0px 30px 0px ')
        return(
            <Grid id="app" fluid={true} style={{height: '100%'}} >
                <Row style={{height: '100%'}}>
                    <Col md={2} xs={2} style={{padding: 0, height: '100%'}} id="colLeft">
  
                        <DaliCarousel 
                                      boxes={boxes}
                                      navItemsIds={navItemsIds}
                                      navItems={navItems}
                                      navItemSelected={navItemSelected}
                                      displayMode={displayMode}
                                      onPageAdded={(caller, value) => dispatch(togglePageModal(caller, value))}
                                      onSectionAdded={(id, name, parent, children, level, type, position) => dispatch(addNavItem(id, name, parent, children, level, type, position))}
                                      onNavItemSelected={id => dispatch(selectNavItem(id))}
                                      onNavItemExpanded={(id, value) => dispatch(expandNavItem(id, value))}
                                      onNavItemRemoved={(ids, parent,boxes) => dispatch(removeNavItem(ids, parent, boxes))}
                                      onNavItemReorded={(itemId,newParent,type,newIndId,newChildrenInOrder) => dispatch(reorderNavItem(itemId,newParent,type,newIndId,newChildrenInOrder))}
                                      onDisplayModeChanged={mode => dispatch(changeDisplayMode(mode))} />

                    </Col>

                    <Col md={10} xs={10} className="outter" id="colRight" style={{ padding: paddings}} >
                        <DaliCanvas boxes={boxes}
                                    boxesIds={boxesIds}
                                    boxSelected={boxSelected}
                                    boxLevelSelected={boxLevelSelected}
                                    navItems={navItems}
                                    navItemSelected={navItems[navItemSelected]}
                                    showCanvas={(navItemsIds.length !== 0)}
                                    toolbars={toolbars}
                                    onBoxSelected={(id) => dispatch(selectBox(id))}
                                    onBoxLevelIncreased={() => dispatch(increaseBoxLevel())}
                                    onBoxMoved={(id, x, y) => dispatch(moveBox(id, x, y))}
                                    onBoxResized={(id, width, height) => dispatch(resizeBox(id, width, height))}
                                    onSortableContainerResized={(id, parent, height) => dispatch(resizeSortableContainer(id, parent, height))}
                                    onBoxReorder={(ids, parent) => dispatch(reorderBox(ids, parent))}
                                    onBoxDropped={(id, row, col) => dispatch(dropBox(id, row, col))}
                                    onTextEditorToggled={(caller, value, text) => dispatch(toggleTextEditor(caller, value, text))}
                                    titleModeToggled={(id, value) => dispatch(toggleTitleMode(id, value))} />
                    </Col>
                </Row>
                <PageModal visibility={pageModalToggled.value}
                           caller={pageModalToggled.caller}
                           navItems={navItems}
                           navItemsIds={navItemsIds}
                           onBoxAdded={(ids, type,  draggable, resizable, content, toolbar, config, state) => dispatch(addBox(ids, type, draggable, resizable, content, toolbar, config, state))}
                           onVisibilityToggled={(caller, value) => dispatch(togglePageModal(caller, value))}
                           onPageAdded={(id, name, parent, children, level, type, position) => dispatch(addNavItem(id, name, parent, children, level, type, position))} />
                <Visor  id="visor" visor={this.state.visor} onVisibilityToggled={()=> this.setState({visor:!this.state.visor })} state={this.props.store.getState().present} />
                <PluginConfigModal />

                <DaliNavBar isBusy={isBusy}
                            hideTab = {this.state.hideTab}
                            undoDisabled = {undoDisabled}
                            redoDisabled = {redoDisabled}
                            navItemsIds = {navItemsIds}
                            navItemSelected = {navItemSelected}
                            boxSelected = {boxSelected}
                            undo = {() => {dispatch(ActionCreators.undo())}}
                            redo = {() => {dispatch(ActionCreators.redo())}}
                            visor = {() =>{this.setState({visor:true })}}
                            export = {() => {DaliVisor.exports(this.props.store.getState())}}
                            scorm = {() => {DaliScorm.exports(this.props.store.getState())}}
                            save = {() => {dispatch(exportStateAsync(this.props.store.getState()))}}
                            categoria={this.state.pluginTab}
                            opens = {() => {dispatch(importStateAsync())}}
                            setcat={(categoria) => {
                                if(this.state.pluginTab == categoria && this.state.hideTab == 'show'){
                                    this.setState({ hideTab:'hide'})
                                } else {
                                    this.setState({pluginTab:categoria, hideTab:'show'})
                                }
                            }}/>
                <PluginRibbon disabled = {navItemsIds.length === 0 ? true : false}
                              navItemSelected={navItemSelected}
                              category={this.state.pluginTab}
                              hideTab={this.state.hideTab} />

                <PluginToolbar toolbars={toolbars}
                               box={boxes[boxSelected]}
                               boxSelected={boxSelected}
                               onColsChanged={(id, parent, distribution) => dispatch(changeCols(id, parent, distribution))}
                               onRowsChanged={(id, parent, column, distribution) => dispatch(changeRows(id, parent, column, distribution))}
                               onBoxResized={(id, width, height) => dispatch(resizeBox(id, width, height))}
                               onTextEditorToggled={(caller, value, text) => dispatch(toggleTextEditor(caller, value, text))}
                               onToolbarUpdated={(caller, index, name, value) => dispatch(updateToolbar(caller, index, name, value))}
                               onToolbarCollapsed={(id) => dispatch(collapseToolbar(id))}
                               onBoxDeleted={()=> this.props.dispatch(deleteBox(boxSelected, boxes[boxSelected].parent, boxes[boxSelected].container)) } />
            </Grid>
        );
    }

    componentDidMount(){
        Dali.Plugins.loadAllAsync().then(values => {
            values.map((id, index) =>{
                Dali.Plugins.get(id).init();
            })
        });

        Dali.API.Private.listenEmission(Dali.API.Private.events.render, e => {
            if(e.detail.isUpdating) {
                this.props.dispatch(updateBox(e.detail.ids.id, e.detail.content, e.detail.state));
            }else {
                this.parsePluginContainers(e.detail.content, 0);
                this.props.dispatch(addBox(
                    {
                        parent: e.detail.ids.parent,
                        id: ID_PREFIX_BOX + Date.now(),
                        container: e.detail.ids.container
                    },
                    BOX_TYPES.NORMAL,
                    true,
                    (e.detail.ids.container === 0),
                    e.detail.content,
                    e.detail.toolbar,
                    e.detail.config,
                    e.detail.sections, 
                    e.detail.state,
                    e.detail.initialParams));

            }
        });

        window.onkeyup = function(e) {
          var key = e.keyCode ? e.keyCode : e.which;
          if (key == 90 && e.ctrlKey){
            this.props.dispatch(ActionCreators.undo())
          }
          if (key == 89 && e.ctrlKey){
            this.props.dispatch(ActionCreators.redo())
          }
          else if (key == 46) {
              if ( this.props.boxSelected != -1){
                let box =  this.props.boxes[ this.props.boxSelected];
                this.props.dispatch(deleteBox(box.id, box.parent, box.container));
              }
          }  
        }.bind(this);
    }

    parsePluginContainers(obj, n){
        if(obj.child){
            for(let i = 0; i < obj.child.length; i++){
                this.parsePluginContainers(obj.child[i], n++);
            }
        }
        if(obj.tag && obj.tag === "plugin"){
            if(obj.attr){
                obj.attr['plugin-data-id'] = ID_PREFIX_SORTABLE_CONTAINER + Date.now() + n;
            }else{
                obj.attr = {'plugin-data-id': ID_PREFIX_SORTABLE_CONTAINER + Date.now() + n};
            }
        }
        if(obj.attr && obj.attr.class){
            obj.attr.className = obj.attr.class.join(' ');
            delete(obj.attr.class);
        }
    }
}

function mapStateToProps(state){
    return{
        boxes: state.present.boxesById,
        boxesIds: state.present.boxes,
        boxSelected: state.present.boxSelected,
        boxLevelSelected: state.present.boxLevelSelected,
        navItemsIds: state.present.navItemsIds,
        navItems: state.present.navItemsById,
        navItemSelected: state.present.navItemSelected,
        pageModalToggled: state.present.pageModalToggled,
        undoDisabled: state.past.length === 0,
        redoDisabled: state.future.length === 0,
        displayMode: state.present.displayMode,
        toolbars: state.present.toolbarsById,
        isBusy: state.present.isBusy
    }
}

export default connect(mapStateToProps)(DaliApp);
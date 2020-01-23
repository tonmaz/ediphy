import React, { Component, Suspense } from 'react';
import i18n from 'i18next';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './../../../../node_modules/rc-color-picker/assets/index.css';
import { connect } from "react-redux";

import { Modal, Button, Row, Col, FormGroup, ControlLabel, FormControl, Grid, Radio } from 'react-bootstrap';
import { updateUI } from "../../../../common/actions";
import ToggleSwitch from '@trendmicro/react-toggle-switch';
import { Code } from 'react-content-loader';
import Alert from './../../common/alert/Alert';
import { isSection, isContainedView, nextAvailName, makeBoxes, isValidSvgPath } from '../../../../common/utils';
import _handlers from "../../../handlers/_handlers";
import { ID_PREFIX_RICH_MARK, ID_PREFIX_SORTABLE_BOX, ID_PREFIX_CONTAINED_VIEW, PAGE_TYPES } from '../../../../common/constants';
import TemplatesModal from "../../carousel/templatesModal/TemplatesModal";

import { ModalContainer, TypeSelector, MarkTypeTab, TypeTab, SizeSlider, LinkToContainer } from "./Styles";
import ColorPicker from "../../common/colorPicker/ColorPicker";
import IconPicker from "../../common/iconPicker/IconPicker";
import { MarkPreview } from "./MarkPreview";

/**
 * Modal component to   edit marks' configuration
 */
class RichMarksModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            connectMode: "new",
            displayMode: "navigate",
            newSelected: this.props.navItemsById[this.props.navItemSelected] ? this.props.navItemsById[this.props.navItemSelected].type : "",
            existingSelected: "",
            newType: PAGE_TYPES.SLIDE,
            image: false,
            svg: false,
            viewNames: this.returnAllViews(this.props),
            showAlert: false,
            showTemplates: false,
            boxes: [],
            originalDimensions: {},
            markType: "icon",
            secret: false,
            color: '#000000',
            changed: false,
        };

        this.h = _handlers(this);
    }

    /**
     * Before component receives props
     * Updates component's state with toolbar's state info
     * @param nextProps
     */
    UNSAFE_componentWillReceiveProps(nextProps) {
        let current = nextProps.currentRichMark;
        let allViews = this.returnAllViews(nextProps);
        if (current) {
            this.setState({
                viewNames: allViews,
                text: current.text,
                svg: current.svg === false ? nextProps.markCursorValue ?? false : false,
                selectedIcon: current.content?.selectedIcon ?? null,
                color: current.color || null,
                size: current.size,
                image: current.content?.url ?? null,
                connectMode: current.connectMode || "new",
                displayMode: current.displayMode || "navigate",
                newSelected: (current.connectMode === "new" ? current.connection : ""),
                newType: nextProps.navItemsById[nextProps.navItemSelected] ? nextProps.navItemsById[nextProps.navItemSelected].type : "",
                existingSelected: (current.connectMode === "existing" && this.remapInObject(nextProps.navItemsById, nextProps.containedViewsById)[current.connection] ?
                    this.remapInObject(nextProps.navItemsById, nextProps.containedViewsById)[current.connection].id : ""),
                markType: current.markType,
                changed: false,
            });
        } else {
            this.setState({
                viewNames: allViews,
                color: '#000000',
                selectedIcon: "room",
                size: 25,
                image: false,
                svg: false,
                connectMode: "new",
                displayMode: "navigate",
                newSelected: "",
                newType: nextProps.navItemsById[nextProps.navItemSelected] ? nextProps.navItemsById[nextProps.navItemSelected].type : "",
                existingSelected: "",
                markType: nextProps.markType || "icon",
                changed: false,
            });
        }
        console.log(this.state);
    }

    /**
     * Render React Component
     * @returns {code}
     */
    render() {
        // TODO refactor con ? ??
        let pluginToolbar = this.props.pluginToolbarsById[this.props.boxSelected];
        let marksType = pluginToolbar?.pluginId
                        && Ediphy.Plugins.get(pluginToolbar.pluginId)?.getConfig()?.marksType
            ? Ediphy.Plugins.get(pluginToolbar.pluginId).getConfig().marksType : {};
        let current = this.props.tempMarkState ?? this.props.currentRichMark;
        let selected = this.state.existingSelected && (this.props.containedViewsById[this.state.existingSelected] || this.props.navItemsById[this.state.existingSelected]) ? (isContainedView(this.state.existingSelected) ? { label: this.props.containedViewsById[this.state.existingSelected].name, id: this.state.existingSelected } :
            { label: this.props.navItemsById[this.state.existingSelected].name, id: this.state.existingSelected }) : this.returnAllViews(this.props)[0] || [];
        let newSelected = "";
        if (this.props.viewToolbarsById[this.state.newSelected] !== undefined) {
            newSelected = this.props.viewToolbarsById[this.state.newSelected].viewName;
        }
        let defaultMarkValue = plugin ? Ediphy.Plugins.get(pluginToolbar.pluginId).getDefaultMarkValue(pluginToolbar.state, this.props.boxSelected) : '';
        let plugin = (pluginToolbar && pluginToolbar.pluginId && Ediphy.Plugins.get(pluginToolbar.pluginId)) ? Ediphy.Plugins.get(pluginToolbar.pluginId) : undefined;
        let pluginType = (pluginToolbar && pluginToolbar.config) ? pluginToolbar.config.displayName : 'Plugin';
        let config = plugin ? plugin.getConfig() : null;
        let newId = "";
        let imageSize = (this.state.size / 100);

        let originalDimensions = this.state.oDimensions;
        let previewSize = {};
        if(this.props.boxesById[this.props.boxSelected] && document.getElementById("box-" + this.props.boxesById[this.props.boxSelected].id)) {
            let y = document.getElementById("box-" + this.props.boxesById[this.props.boxSelected].id).getBoundingClientRect().height;
            let x = document.getElementById("box-" + this.props.boxesById[this.props.boxSelected].id).getBoundingClientRect().width;
            let selectedPluginAspectRatio = x / y;
            previewSize.height = x > y ? String(15 / selectedPluginAspectRatio) + "em" : "15em";
            previewSize.width = x > y ? "15em" : String(15 * selectedPluginAspectRatio) + "em";
            previewSize.aspectRatio = selectedPluginAspectRatio;
        }

        const LazyIconPicker = React.lazy(() => {
            return new Promise(resolve => {
                setTimeout(() => resolve(import("../../common/iconPicker/IconPicker")), 5);
            });
        });

        return (
            <ModalContainer backdrop bsSize="large" show={this.props.richMarksVisible}>
                <Modal.Header>
                    <Modal.Title><i style={{ fontSize: '18px' }} className="material-icons">room</i> {(current ? i18n.t("marks.edit_mark_to") : i18n.t("marks.add_mark_to")) + pluginType }</Modal.Title>
                </Modal.Header>
                <Modal.Body className="gcModalBody">
                    <Grid>
                        <Row>
                            <Col xs={12} md={6} lg={6} >
                                <h4> {i18n.t("configuration")}</h4>
                                <FormGroup>
                                    <ControlLabel>{i18n.t("marks.mark_name")}</ControlLabel>
                                    <FormControl ref="title"
                                        placeholder={i18n.t("marks.mark_name_preview")}
                                        type="text"
                                        defaultValue={current ? current.title : ''}/><br/>
                                    {/* Input need to have certain label like richValue*/}
                                    <ControlLabel>{marksType.name ? marksType.name : i18n.t("marks.value")}</ControlLabel><br/>
                                    <ControlLabel style={{ color: 'grey', fontWeight: 'lighter', marginTop: '-5px' }}>
                                        {(config &&
                                                config.marksType &&
                                                config.marksType &&
                                                config.marksType.format) ?
                                            config.marksType.format : "x,y"}
                                    </ControlLabel>
                                    <FormControl
                                        key={this.props.markCursorValue}
                                        ref="value"
                                        type={this.state.actualMarkType}
                                        defaultValue={this.props.markCursorValue ? this.props.markCursorValue : (current ? current.value : (defaultMarkValue ? defaultMarkValue : 0))}
                                    />
                                    <ControlLabel>{i18n.t("type")}</ControlLabel>
                                    <MarkTypeTab type="radio" value={this.state.markType} name="markTypeSelector">
                                        <TypeTab
                                            type="radio"
                                            value="icon"
                                            name="mark_type"
                                            onClick={() => this.setState({ markType: "icon" })}
                                        >{i18n.t("icon")}</TypeTab>
                                        <TypeTab
                                            type="radio"
                                            value="image"
                                            name="mark_type"
                                            onClick={() => this.setState({ markType: "image", changed: false })}
                                        >{i18n.t("image")}</TypeTab>
                                        <TypeTab
                                            type="radio"
                                            value="area"
                                            name="mark_type"
                                            onClick={() => this.setState({ markType: "area", changed: false })}
                                        >{i18n.t("area")}</TypeTab>
                                    </MarkTypeTab>
                                </FormGroup>
                                <FormGroup>
                                    <ControlLabel>{this.state.markType === 'area' ? 'Shape' : 'Position'}</ControlLabel><br/>
                                    <ControlLabel style={{ color: 'grey', fontWeight: 'lighter', marginTop: '-5px' }}>
                                        {this.state.markType === 'area' ? 'SVG Path' : config?.marksType?.format ?? "x,y"}
                                    </ControlLabel>
                                    <FormControl
                                        key={this.props.markCursorValue}
                                        ref="value"
                                        type={this.state.actualtype}
                                        defaultValue={this.getMarkValue()}
                                    />
                                    {this.state.markType === 'area' ?
                                        [<br/>,
                                            <button style={{ width: "100%" }} className="avatarButtons btn btn-primary" onClick={this.openAreaCreator}>Draw new shape</button>]
                                        : null
                                    }
                                </FormGroup>
                                <FormGroup>
                                    {(this.state.markType === "icon" || this.state.markType === "area") ? // Selector de color
                                        <FormGroup onClick={e => e.stopPropagation()}>
                                            <ControlLabel>Color</ControlLabel>
                                            <div>
                                                <ColorPicker
                                                    color={this.state.color || marksType.defaultColor}
                                                    value={this.state.color || marksType.defaultColor}
                                                    onChange={e=>{this.setState({ color: e.color, changed: true });}}
                                                />
                                                {
                                                    this.state.markType === "area" ?
                                                        ([<br/>,
                                                            <div>
                                                                <ToggleSwitch onChange={()=>{this.setState({ secretArea: !this.state.secretArea, color: 'rgba(255,255,255,0)' });}} checked={this.state.secretArea}/>
                                                        Área secreta
                                                            </div>])
                                                        : null
                                                }
                                            </div>
                                        </FormGroup>
                                        : null
                                    }
                                    {this.state.markType === "image" ? // Importar imagen
                                        <FormGroup>
                                            <ControlLabel>{i18n.t("marks.import_image")}</ControlLabel>
                                            <button style={{ width: "100%" }} className="avatarButtons btn btn-primary" onClick={this.loadImage}>{i18n.t("marks.import_image")}</button>
                                        </FormGroup>
                                        : null
                                    }
                                    <FormGroup hidden={this.state.markType !== "icon"}>
                                        <ControlLabel>{i18n.t("marks.selector")}</ControlLabel>
                                        {this.state.changed === false ?
                                            <Suspense fallback={ <div><Code/>{console.log("fallback")}</div>}>
                                                <LazyIconPicker text={this.state.selectedIcon} onChange={e=>{this.setState({ selectedIcon: e.selectedIcon, changed: true });}}/>
                                            </Suspense>
                                            : <IconPicker text={this.state.selectedIcon} onChange={e=>{this.setState({ selectedIcon: e.selectedIcon, changed: true });}}/>
                                        }
                                    </FormGroup>
                                    {this.state.markType === "icon" || this.state.markType === "image" ?
                                        <SizeSlider>
                                            <ControlLabel>{i18n.t("size")}</ControlLabel>
                                            <FormControl type={'range'} min={10} max={100} step={1} value={this.state.size} onChange={()=>{this.setState({ size: event.target.value, changed: true });}} />
                                        </SizeSlider>
                                        : null
                                    }
                                </FormGroup>
                            </Col>
                            <Col xs={12} md={6} lg={6}>
                                <Row>
                                    <MarkPreview state={this.state} props={this.props}/>
                                    <FormGroup>
                                        <h4>{i18n.t("marks.link_to")}</h4>
                                        <div>
                                            <LinkToContainer className="btn-group" data-toggle="buttons" >
                                                <Radio value="new"
                                                    name="connect_mode"
                                                    checked={this.state.connectMode === "new"}
                                                    onChange={() => {
                                                        this.setState({ connectMode: "new" });
                                                    }}>{i18n.t("marks.new_content")}</Radio>
                                                <Radio value="existing"
                                                    name="connect_mode"
                                                    disabled={!this.returnAllViews(this.props).length > 0}
                                                    checked={this.state.connectMode === "existing"}
                                                    onChange={() => {
                                                        this.setState({ connectMode: "existing" });
                                                    }}>{i18n.t("marks.existing_content")}</Radio>
                                                <Radio value="external"
                                                    name="connect_mode"
                                                    checked={this.state.connectMode === "external"}
                                                    onChange={() => {
                                                        this.setState({ connectMode: "external" });
                                                    }}>{i18n.t("marks.external_url")}</Radio>
                                                <Radio value="popup"
                                                    name="connect_mode"
                                                    checked={this.state.connectMode === "popup"}
                                                    onChange={() => {
                                                        this.setState({ connectMode: "popup" });
                                                    }}>{i18n.t("marks.popup")}</Radio>
                                            </LinkToContainer>
                                        </div>
                                        <div style={{ display: this.state.connectMode === "new" ? "none" : "initial" }}>
                                            {i18n.t("marks.hover_message")} <strong>{newSelected}</strong>
                                        </div>
                                    </FormGroup>
                                </Row>
                                <Row>
                                    <FormGroup>
                                        <FormGroup style={{ display: this.state.connectMode === "new" ? "block" : "none" }}>
                                            <h4>{i18n.t("marks.new_content_label")}</h4>
                                            <TypeSelector>
                                                <FormControl componentClass="select"
                                                    defaultValue={this.state.newType}
                                                    style={{ width: "80%" }}
                                                    onChange={e => {
                                                        this.setState({ newType: e.nativeEvent.target.value });
                                                    }}>
                                                    <option value={PAGE_TYPES.DOCUMENT}>{i18n.t("marks.new_document")}</option>
                                                    <option value={PAGE_TYPES.SLIDE}>{i18n.t("marks.new_slide")}</option>
                                                </FormControl>

                                                <Button className={"templateSettingMarks"} style={{ display: this.state.newType === "slide" ? 'flex' : 'none' }} onClick={this.toggleTemplatesModal} > <i className={"material-icons"}>settings</i> </Button>
                                            </TypeSelector>
                                        </FormGroup>
                                        <FormGroup style={{ display: this.state.connectMode === "existing" ? "initial" : "none" }}>
                                            <ControlLabel>{i18n.t("marks.existing_content_label")}</ControlLabel>
                                            {this.state.connectMode === "existing" && <FormControl componentClass="select" onChange={e=>{this.setState({ existingSelected: e.target.value });}}>
                                                {this.returnAllViews(this.props).map(view=>{
                                                    return <option key={view.id} value={view.id}>{this.props.viewToolbarsById[view.id].viewName}</option>;
                                                })}
                                            </FormControl>}
                                        </FormGroup>
                                        <FormGroup style={{ display: this.state.connectMode === "external" ? "initial" : "none" }}>
                                            <ControlLabel>{i18n.t("marks.external_url_label")}</ControlLabel>
                                            <FormControl ref="externalSelected"
                                                type="text"
                                                defaultValue={current && this.state.connectMode === "external" ? current.connection : "http://vishub.org/"}
                                                placeholder="URL"/>
                                        </FormGroup>
                                        <FormGroup style={{ display: this.state.connectMode === "popup" ? "initial" : "none" }}>
                                            <ControlLabel>{i18n.t("marks.popup_label")}</ControlLabel>
                                            <FormControl ref="popupSelected" componentClass="textarea"
                                                defaultValue={current && this.state.connectMode === "popup" ? current.connection : ""}
                                                placeholder={i18n.t("marks.popup_placeholder")}/>
                                        </FormGroup>
                                    </FormGroup>
                                </Row>
                            </Col>
                        </Row>
                    </Grid>
                </Modal.Body>

                <Modal.Footer>
                    {/* <span>También puedes arrastrar el icono <i className="material-icons">room</i> dentro del plugin del vídeo para añadir una nueva marca</span>*/}
                    <Button onClick={() => {
                        this.h.onRichMarksModalToggled();
                        this.restoreDefaultTemplate();
                    }}>Cancel</Button>
                    <Button bsStyle="primary" onClick={() => {
                        let title = ReactDOM.findDOMNode(this.refs.title).value;
                        newId = ID_PREFIX_CONTAINED_VIEW + Date.now();
                        let newMark = current && current.id ? current.id : ID_PREFIX_RICH_MARK + Date.now();
                        let connectMode = this.state.connectMode;
                        let connection = selected.id;
                        let markState;
                        let value = ReactDOM.findDOMNode(this.refs.value).value;
                        if(this.state.markType === 'area' && !isValidSvgPath(value)) {
                            this.setState({
                                showAlert: true,
                                alertMsg: 'No has introducido un área correcta',
                            });
                            return;
                        }
                        let content = ({});
                        let color;
                        let size;
                        console.log('State is ', this.state);
                        switch(this.state.markType) {
                        case "icon":
                            content.selectedIcon = this.state.selectedIcon || "";
                            color = this.state.color || marksType.defaultColor || '#222222';
                            size = this.state.size;
                            break;
                        case "area":
                            console.log('State is: ', this.state);
                            color = this.state.color || marksType.defaultColor || '#222222';
                            content.svg = this.state.svg;
                            break;
                        case "image":
                            size = this.state.size;
                            content.imageDimensions = ({});
                            content.imageDimensions.width = previewSize.height < previewSize.width ? 100 * imageSize : (100 * imageSize / previewSize.aspectRatio * originalDimensions.aspectRatio);
                            content.url = this.state.image || this.props.fileModalResult.value;
                            break;
                        default:
                            break;
                        }

                        // CV name
                        let name = connectMode === "existing" ? this.props.viewToolbarsById[connection].viewName : nextAvailName(i18n.t('contained_view'), this.props.viewToolbarsById, 'viewName');
                        // Mark name
                        title = title || nextAvailName(i18n.t("marks.new_mark"), this.props.marksById, 'title');
                        // let value = this.props.markCursorValue;
                        // First of all we need to check if the plugin creator has provided a function to check if the input value is allowed
                        if (plugin && plugin.validateValueInput) {
                            let val = plugin.validateValueInput(value);
                            // If the value is not allowed, we show an alert with the predefined message and we abort the Save operation
                            if (val && val.isWrong) {
                                this.setState({ showAlert: true, alertMsg: (val.message ? val.message : i18n.t("mark_input")) });
                                return;
                                // If the value is allowed we check if it has been modified (like rounded decimals) and we assign it to value
                            } else if (val && val.value) {
                                value = val.value;
                            }
                        }
                        let sortable_id = ID_PREFIX_SORTABLE_BOX + Date.now();
                        switch (connectMode) {
                        case "new":
                            markState = {
                                mark: {
                                    id: newMark,
                                    origin: this.props.boxSelected,
                                    title: title,
                                    connection: newId,
                                    connectMode: connectMode,
                                    displayMode: this.state.displayMode,
                                    value: value,
                                    markType: this.state.markType,
                                    content: content,
                                    color: color,
                                    size: size,
                                },
                                view: {
                                    info: "new",
                                    type: this.state.newType,
                                    id: newId,
                                    parent: { [newMark]: this.props.boxSelected },
                                    // name: name,
                                    boxes: this.state.newType === "document" ? [sortable_id] : [],
                                    extraFiles: {},
                                },
                                viewToolbar: {
                                    id: newId,
                                    doc_type: this.state.newType,
                                    viewName: name,
                                    hideTitles: this.state.boxes.length > 0,
                                },
                            };
                            break;
                        case "existing":
                            markState = {
                                mark: {
                                    id: newMark,
                                    origin: this.props.boxSelected,
                                    title: title,
                                    connection: connection,
                                    connectMode: connectMode,
                                    displayMode: this.state.displayMode,
                                    value: value,
                                    markType: this.state.markType,
                                    content: content,
                                    color: color,
                                    size: size,
                                },
                                view: {
                                    info: "new",
                                    type: this.state.newType,
                                    id: newId,
                                    parent: this.props.boxSelected,
                                    name: name,
                                    boxes: [],
                                    extraFiles: {},
                                },
                            };
                            break;
                        case "external":
                            markState = {
                                mark: {
                                    id: newMark,
                                    origin: this.props.boxSelected,
                                    title: title,
                                    connection: ReactDOM.findDOMNode(this.refs.externalSelected).value,
                                    connectMode: connectMode,
                                    displayMode: this.state.displayMode,
                                    value: value,
                                    markType: this.state.markType,
                                    content: content,
                                    color: color,
                                    size: size,
                                },
                            };
                            break;
                        case "popup":
                            markState = {
                                mark: {
                                    id: newMark,
                                    origin: this.props.boxSelected,
                                    title: title,
                                    connection: ReactDOM.findDOMNode(this.refs.popupSelected).value,
                                    connectMode: connectMode,
                                    displayMode: this.state.displayMode,
                                    value: value,
                                    markType: this.state.markType,
                                    content: content,
                                    color: color,
                                    size: size,
                                },
                            };
                            break;
                        }
                        if(this.props.marksById[newMark] === undefined) {
                            this.h.onRichMarkAdded(markState.mark, markState.view, markState.viewToolbar);
                        } else{
                            this.h.onRichMarkUpdated(markState.mark, markState.view, markState.viewToolbar);
                        }
                        this.generateTemplateBoxes(this.state.boxes, newId);
                        this.restoreDefaultTemplate();
                        this.h.onRichMarksModalToggled();
                    }}>{i18n.t("marks.save_changes")}</Button>
                </Modal.Footer>
                <Alert className="pageModal"
                    show={this.state.showAlert}
                    hasHeader
                    title={i18n.t("marks.wrong_value")}
                    closeButton onClose={()=>{this.setState({ showAlert: false });}}>
                    <span> {this.state.alertMsg} </span>
                </Alert>
                <TemplatesModal
                    fromRich
                    show={this.state.showTemplates}
                    close={this.toggleTemplatesModal}
                    navItems={this.props.navItemsById}
                    boxes={this.props.boxesById}
                    onIndexSelected={this.props.onIndexSelected}
                    indexSelected={this.props.indexSelected}
                    onBoxAdded={this.h.onBoxAdded}
                    calculatePosition={this.calculatePosition}
                    templateClick={this.templateClick}
                    idSlide = {newId || ""}/>
            </ModalContainer>
        );
    }

    /**
     * Mapping method that joins contained views and navItems in array but excluding the ones that can't be
     * @param props Component's props
     * @returns {Array} Array of views
     */
    returnAllViews = (props) => {
        let viewNames = [];
        props.navItemsIds.map(id => {
            if (id === 0) {
                return;
            }
            if (props.navItemsById[id].hidden) {
                return;
            }
            if(!Ediphy.Config.sections_have_content && isSection(id)) {
                return;
            }
            // We need to turn off this requisite in case there is no more pages available and we need to link to the same page the box is in
            if(props.containedViewSelected === 0 && props.navItemSelected === id) {
                return;
            }

            viewNames.push({ label: props.navItemsById[id].name, id: id });
        });
        Object.keys(props.containedViewsById).map(cv=>{
            if(cv === 0) {
                return;
            }

            if(props.containedViewSelected === cv) {
                return;
            }
            viewNames.push({ label: props.containedViewsById[cv].name, id: props.containedViewsById[cv].id });
        });
        return viewNames;
    };

            /**
             * Method used to remap navItems and containedViews together
             * @param objects
             * @returns {*}
             */
            remapInObject = (...objects) => {
                return Object.assign({}, ...objects);
            };

            toggleModal = (e) => {
                let key = e.keyCode ? e.keyCode : e.which;
                if (key === 27 && this.props.richMarksVisible) {
                    this.h.onRichMarksModalToggled();
                }
            };

            /**
             * Shows/Hides the Import file modal
             */
            toggleTemplatesModal = () => {
                this.setState((prevState) => ({
                    showTemplates: !prevState.showTemplates,
                }));
            };

            templateClick = (boxes) => {
                this.setState({
                    boxes: boxes,
                });
            };

    restoreDefaultTemplate = () => {
        this.setState({
            boxes: [],
        });
    };

    generateTemplateBoxes = (boxes, newId) => {
        if(boxes.length > 0) {
            makeBoxes(boxes, newId, this.props);
        }
    };

    componentDidMount() {
        window.addEventListener('keyup', this.toggleModal);
    }
    componentWillUnmount() {
        window.removeEventListener('keyup', this.toggleModal);
    }

    // Function to get image size to render
    onImgLoad = ({ target: img }) => {
        if(!this.state.originalDimensions.height) {
            let aspectRatio = img.offsetWidth / img.offsetHeight;
            let biggerDimension;
            if(img.offsetHeight > img.offsetWidth) {
                biggerDimension = "Height";
            }else{
                biggerDimension = "Width";
            }
            this.setState({ originalDimensions: { aspectRatio, biggerDimension } });
        }
    };

    loadImage = () => {
        this.toggleFileUpload('image', 'image/*');
        this.setState({ image: false });
        this.setState({ originalDimensions: false });
    };

    openAreaCreator = () => {
        this.h.onAreaCreatorVisible('box-' + this.props.boxSelected, this.state);
        this.h.onRichMarksModalToggled();
        this.h.onRichMarkEditPressed(this.state);
    };

    toggleFileUpload = (id, accept) => {
        this.props.dispatch(updateUI({
            showFileUpload: accept,
            fileModalResult: { id: id, value: undefined },
            fileUploadTa: 0,
        }));
    };

    getMarkValue = () => {
        switch (this.state.markType) {
        case 'area':
            return this.props.markCursorValue?.svgPath ?? this.props.currentRichMark?.content?.svgPath ?? 'Draw a shape';
        default:
            return this.props.markCursorValue ?? this.props.currentRichMark?.value ?? 0;
        }
    };
    getMarkPreview = () => {
        switch (this.state.markType) {
        case 'area':
            let path = this.props.markCursorValue?.svgPath ?? this.props.currentRichMark?.content?.svgPath ?? false;
            return path ? (
                <div style={{ width: '100%' }}>
                    <svg
                        viewBox={`0 0 ${this.state.svg?.canvasSize?.width ?? 0} ${this.state.svg?.canvasSize?.height ?? 0}`}
                        style={{ pointerEvents: 'none' }}
                        height={'100%'} width={'100%'}
                        preserveAspectRatio="none">
                        <path d={path} fill={this.state.color || '#000000'}/>
                    </svg>
                </div>
            ) : 'Draw a shape';
        case 'image':
            let originalDimensions = this.state.originalDimensions;
            let previewSize = {};
            let imageSize = (this.state.size / 100);
            if (this.props.boxesById[this.props.boxSelected] && document.getElementById("box-" + this.props.boxesById[this.props.boxSelected].id)) {
                let y = document.getElementById("box-" + this.props.boxesById[this.props.boxSelected].id).getBoundingClientRect().height;
                let x = document.getElementById("box-" + this.props.boxesById[this.props.boxSelected].id).getBoundingClientRect().width;
                let selectedPluginAspectRatio = x / y;
                previewSize.height = x > y ? String(15 / selectedPluginAspectRatio) + "em" : "15em";
                previewSize.width = x > y ? "15em" : String(15 * selectedPluginAspectRatio) + "em";
                previewSize.aspectRatio = selectedPluginAspectRatio;
            }
            let width = previewSize.height < previewSize.width ? 100 * imageSize : (100 * imageSize / previewSize.aspectRatio * originalDimensions.aspectRatio);
            let source = this.state.image ? this.state.image : this.props.fileModalResult?.value || "https://live.staticflickr.com/65535/49246500741_6ef20b5fcd.jpg";
            return (<div style={{
                height: previewSize.height,
                width: previewSize.width,
                marginLeft: "7%",
                border: "1px dashed grey",
            }}>
                <img height="auto" width={String(width) + "%"} onLoad={this.onImgLoad} src={source}/>
            </div>);
        case 'icon':
            let icon = this.state.selectedIcon ?? 'room';
            return <i className="material-icons" style={{
                color: (this.state.color || "black"),
                fontSize: (this.state.size / 10) + "em",
                paddingLeft: "7%",
            }}>{icon}</i>;
        default:
            return null;
        }
    }

}

function mapStateToProps(state) {
    const { markCursorValue, currentRichMark, richMarksVisible, tempMarkState } = state.reactUI;
    const { boxesById, boxSelected, pluginToolbarsById, navItemSelected, viewToolbarsById, containedViewSelected,
        containedViewsById, marksById, navItemsIds, navItemsById } = state.undoGroup.present;

    return{
        boxesById,
        boxSelected,
        pluginToolbarsById,
        navItemSelected,
        viewToolbarsById,
        markCursorValue,
        containedViewSelected,
        containedViewsById,
        marksById,
        navItemsById,
        navItemsIds,
        currentRichMark,
        tempMarkState,
        reactUI: state.reactUI,
        richMarksVisible,
    };
}

export default connect(mapStateToProps)(RichMarksModal);

RichMarksModal.propTypes = {
    /**
     * Caja seleccionada
     */
    boxSelected: PropTypes.any.isRequired,
    /**
     * Current selected view (by ID)
     */
    navItemSelected: PropTypes.any.isRequired,
    /**
     * Object containing all contained views (identified by its ID)
     */
    containedViewsById: PropTypes.object.isRequired,
    /**
     * Object containing all views (by id)
     */
    navItemsById: PropTypes.object.isRequired,
    /**
     * Indica si se muestra o oculta el modal de edición de marcas
     */
    richMarksVisible: PropTypes.any.isRequired,
    /**
     * Mark currently being edited
     */
    currentRichMark: PropTypes.any,
    /**
      * Cursor value when creating mark (coordinates)
      */
    markCursorValue: PropTypes.any,
    /**
     * Object containing all the marks
     */
    marksById: PropTypes.object,
    /**
     * Object containing all the viewToolbars
     */
    viewToolbarsById: PropTypes.object,
    /**
     * Object containing all the pluginToolbars
     */
    pluginToolbarsById: PropTypes.object,
    /**
     *  Object containing all created boxes (by id)
     */
    boxesById: PropTypes.object,
    /**
     * Function for getting the id of the selected template
     */
    onIndexSelected: PropTypes.func,
    /**
     * Contains the id of the selected template
     */
    indexSelected: PropTypes.func,
    /**
     * Contains the result of the import image modal
     */
    fileModalResult: PropTypes.any,
    /**
     * Dispatch function
     */
    dispatch: PropTypes.func,
};

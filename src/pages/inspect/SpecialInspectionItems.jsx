// 专项检查->查看
import React from 'react';
import { Link, hashHistory } from 'react-router';
import moment from "moment";
import {
    Pagination,
    Breadcrumb,
    Row,
    Col,
    Select,
    Button,
    TreeSelect,
    Table,
    Spin,
    Modal,
    Tag,
    DatePicker,
} from 'antd';
import $jsonp from '../../utils/service.js'
import $jsonp3 from '../../utils/service3.js';
import api from '../../utils/api.js'
import publicstyle from '../../img/public.less'
import companypng from "../../img/company.png"
import departmentpng from "../../img/department.png"
import emppng from "../../img/emp.png"
import styles from "../stastics/taskIndex.less"
import styles1 from "../../components/common.less"
import styles2 from "../admin/index.less";
import { rmdir } from 'fs';
import stylez from '../../container/index.less';

let self, data;
moment.locale('zh-cn');
const Option = Select.Option, confirm = Modal.confirm, TreeNode = TreeSelect.TreeNode,
    SHOW_PARENT = TreeSelect.SHOW_PARENT;

function e2(arr, items, key) {
    if (items.children && items.children.length > 0) {
        items.children.map((itemss, indexss) => {
            if (itemss.id == key) {
                arr.push(itemss);
            }
            e2(arr, itemss, key);
        })
    }
}

function e1(arr, key, departsArr) {
    departsArr.map((item, index) => {
        if (item.id == key) {
            arr.push(item);
        }
        e2(arr, item, key);
    })
}

function e4(arr, items, key) {
    if (items.children && items.children.length > 0) {
        items.children.map((itemss, indexss) => {
            if (itemss.id == key) {
                arr.push(items);
            }
            e4(arr, itemss, key);
        })
    }
}

function findCompanyLoop(arr, items, key, departsArr) {
    if (items.children && items.children.length > 0) {
        items.children.map((itemss, indexss) => {
            if (itemss.id == key) {
                if (itemss.nodeType == 1) {
                    arr.push(itemss);
                }
                else {
                    findCompanyLoop(arr, itemss, key, departsArr);
                }
            }
            findCompanyLoop(arr, itemss, key, departsArr);
        })
    }
}

function fetchNodeType(nodeType, nodeName) {
    var returnDiv = "";
    if (nodeType == 1) {
        returnDiv = <div><img src={companypng} className={styles1.qicon} />{nodeName}</div>
    }
    else if (nodeType == 2) {
        returnDiv = <div><img src={departmentpng} className={styles1.qicon} />{nodeName}</div>
    }
    else if (nodeType == 3) {
        returnDiv = <div><img src={emppng} className={styles1.qicon} />{nodeName}</div>
    }
    return returnDiv
}

const loop = data => data.map((item) => {
    if (item.children && item.children.length) {
        var ptitle = "";
        ptitle = fetchNodeType(item.nodeType, item.name)

        return <TreeSelect.TreeNode title={ptitle} isLeaf={item.isLeaf} dataRef={item} pops={item.name} key={item.id}
            value={item.id.toString()}>{loop(item.children)}</TreeSelect.TreeNode>;
    }
    var ptitle = "";
    ptitle = fetchNodeType(item.nodeType, item.name)
    return <TreeSelect.TreeNode title={ptitle} isLeaf={item.isLeaf} dataRef={item} pops={item.name} key={item.id}
        value={item.id.toString()} />;
});

export default class specialExamination extends React.Component {
    constructor(props) {
        super(props);
        self = this;
        this.state = {
            current: 1,
            total: 30,
            templateCode: "",
            allTemplates: [],
            statisticYear: "",
            taskState: "",
            accountname: "",
            mobilename: "",
            name: "",
            departmentId: "",
            departmentCode: "",
            roleId: "",
            jobStatus: "",
            loading: false,
            options1: [],
            role: [],
            department: [],
            jobStatusText: "全部",
            roleIdText: "",
            departmentIdText: [],
            treedata1: [],
            treedata2: [],
            expandForm: false,

            checkMsaId: "",
            departments: [],
            startDay: "",
            endDay: "",
            dangeral: null,
            checkCompanyName: "",
            checkCompanyNameValue: [],
            startDayShow: null,
            endDayShow: null
        }
    }


    componentWillMount() {
        data = self.props.location.state;

        this.queryProfitOfCondition();
        self.fetchMsaInfos({ type: "all" });
    }

    componentDidMount() {

    }

    getUserLevel() {
        $jsonp3(self, api.getUserLevel, {})
            .then((res) => {
                console.log(res.data.response.level)
            })
    }

    fetchMsaInfos(data) {
        $jsonp3(self, api.listDepartmentByUser, data).then((res) => {
            self.setState({
                departments: res.data.response.list,
            });
        });
    }

    onMsaIdCheck = (msaIdArray) => {
        self.setState({
            checkMsaId: msaIdArray
        })
    }

    Danger(value) {
        self.setState({
            dangeral: value
        })
    }

    // onsearch
    checkCompanyName(value) {
        $jsonp3(self, api.listCompanyFuzzyQuery, {
            name: value,
        }).then((res) => {
            this.setState({
                checkCompanyNameValue: res.data.response.list,
            });
        });
    }

    // onchange
    // 公司名称
    selectCheckCompanyName(value) {
        self.setState({
            checkCompanyName: value,
        });
    }

    reset = () => {
        this.setState({
            checkMsaId: "",
            startDay: "",
            endDay: "",
            dangeral: null,
            checkCompanyName: "",
            checkCompanyNameValue: [],
            startDayShow: null,
            endDayShow: null
        }, () => self.loadData(1, 10));
    }

    //数据页
    edit() {
        hashHistory.push({
            pathname: '/main/charts',
            state: {
                top: "add",
            }
        })
    }

    //预览
    printIt(record) {
        window.open("/ico/DailySupervisionItemDetails.html?detailId=" + record.id + "&type=2&dangerous=" + record.dangerous + "&isSolve=" + record.isSolve)
    }

    queryProfitOfCondition = () => {
        self.loadData(1, 10);
    }

    loadData = (page, pageSize) => {
        self.setState({
            loading: true
        });
        var self1 = self;
        let index;
        $jsonp3(self1, api.listCheckByConditional, {
            pageNum: page,
            msaId: this.state.checkMsaId,
            startDay: this.state.startDay,
            endDay: this.state.endDay,
            checkType: "2",
            taskId: data.taskId,
            isSolve: this.state.dangeral,
            companyName: this.state.checkCompanyName,
        }).then((res) => {
            var result = [];
            var list = res.data.response.list;
            let index = 1;
            if (list == null || list.length == 0) {
                self.setState({
                    data: result,
                    page: res.data.response.pageInfo,
                    current: res.data.response.pageInfo.pageNum,
                    totalPage: res.data.response.pageInfo.pages,
                    loading: false
                });
                return;
            }
            list.map((item) => {
                let obj = {};
                obj.odrder = (res.data.response.pageInfo.pageNum - 1) * 10 + index++;
                obj.id = item.id;
                obj.name = item.checklistTitle;
                obj.checkSortName = item.checkSortName;
                obj.checkSortId = item.checkSortId;
                obj.startDay = item.startDay;
                obj.endDay = item.endDay;
                obj.checkMsaId = item.checkMsaId;
                obj.isSolve = item.isSolve;
                // obj.isSolveName = item.isSolve == "2" ? "—" :item.isSolve == "0"? "已解决": "未解决";
                obj.createMsaName = item.createMsaName;
                // correctCount:当场纠正数量
                // reviewCount:限期整改数量PS:如果 当场纠正&限期整改 都为0,说明无隐患
                obj.correctCount = item.correctCount;
                obj.reviewCount = item.reviewCount;
                obj.dangerous = item.correctCount + "+" + item.reviewCount
                if (item.correctCount == 0 && item.reviewCount == 0) {
                    obj.danger = `无隐患`;
                } else if (item.correctCount == 0) {
                    obj.danger = `限期整改: ${item.reviewCount}`;
                } else if (item.reviewCount == 0) {
                    obj.danger = `当场纠正: ${item.correctCount}`;
                } else {
                    obj.danger = `当场纠正: ${item.correctCount}  限期整改:${item.reviewCount}`
                }
                var pubdate = null;
                if (item.publishTime != null) {
                    var pubtime = new Date(item.uploadTime);
                    pubdate = (pubtime.getFullYear()) + "年"
                        + (pubtime.getMonth() + 1) + "月"
                        + (pubtime.getDate()) + "日 "
                        + (pubtime.getHours()) + ":"
                        + (pubtime.getMinutes() < 10 ? "0" + pubtime.getMinutes() : pubtime.getMinutes()) + ":"
                        + (pubtime.getSeconds() < 10 ? "0" + pubtime.getSeconds() : pubtime.getSeconds());
                }

                obj.publishTime = (pubdate == null ? "—" : pubdate);

                if (item.statisticsType == "1") {
                    obj.date = item.months.split(',').join("月,") + "月";
                }
                else {
                    obj.date = item.startDay + "至" + item.endDay;
                }
                obj.state = item.state == "1" ? "已发布" : "待发布";
                result.push(obj);
            });

            self.setState({
                data: result,
                page: res.data.response.pageInfo,
                current: res.data.response.pageInfo.pageNum,
                totalPage: res.data.response.pageInfo.pages,
                loading: false
            });

        });
    }

    setStartDay(startDayMement, staryDayStr) {
        self.setState({
            startDayShow: startDayMement,
            startDay: staryDayStr
        });
    }

    setEndDay(endDayMement, endDayStr) {
        self.setState({
            endDayShow: endDayMement,
            endDay: endDayStr
        });
    }

    onPageChange = (page, pageSize) => {
        self.loadData(page, pageSize);
    }
    toFirst = () => {
        self.loadData(1, self.state.page.pageSize);
    }
    toLast = () => {
        self.loadData(self.state.page.pages, self.state.page.pageSize);
    }

    back() {
        window.history.back();
    }

    renderForm() {
        const renderTreeNodes = data => data.map((item) => {
            if (item.children == null || item.children.length == 0) {
                return <TreeNode title={item.name} key={item.id + ""} value={item.id + ""} />;

            } else {
                return (
                    <TreeNode title={item.name} key={item.id + ""} value={item.id + ""}>
                        {renderTreeNodes(item.children)}
                    </TreeNode>
                )
            }
        });
        return (
            <div>
                <Row className={styles.antrow1}>
                    <Col span={6} style={{ textAlign: "right" }}>
                        <span style={{ paddingRight: 10 }}>公司名称:</span>
                        <Select
                            placeholder="公司名称" showSearch
                            value={this.state.checkCompanyName}
                            filterOption={true}
                            onSearch={this.checkCompanyName}
                            onChange={this.selectCheckCompanyName} allowClear={true} showArrow={false}
                            style={{ width: '50%' }}
                        >
                            {this.state.checkCompanyNameValue.map(d => <Option key={d}>{d}</Option>)}
                        </Select>
                    </Col>
                    <Col span={6} push={0}>
                        <span style={{ paddingRight: 10 }}>检查单位:</span>
                        <TreeSelect style={{ width: "60%" }} treeCheckable={false} showCheckedStrategy={SHOW_PARENT}
                            onChange={this.onMsaIdCheck}
                            value={this.state.checkMsaId}>
                            {renderTreeNodes(this.state.departments)}
                        </TreeSelect>
                    </Col>
                    {/*检查时间*/}
                    <Col span={12} push={0}>
                        <div style={{ display: "inline-block" }}>
                            <span style={{ paddingRight: 10 }}>发布日期:</span>
                            <DatePicker style={{ width: "200px" }} onChange={this.setStartDay} placeholder={"开始时间"}
                                value={self.state.startDayShow} />
                        </div>
                        <div style={{ display: "inline-block" }}>
                            <span className={styles.bitian}> &nbsp; 至：</span>
                            <DatePicker style={{ width: "200px" }} onChange={this.setEndDay} value={self.state.endDayShow}
                                placeholder={"结束时间"} />
                        </div>
                    </Col>
                </Row>
                <Row style={{ marginBottom: 10 }}>
                    <Col span={8} style={{ textAlign: "right" }}>
                        <span style={{ paddingRight: 10 }}>隐患是否解决:</span>
                        <Select onChange={this.Danger} value={this.state.dangeral}
                            placeholder=""
                            style={{ width: "60%" }}>
                            <Option value={"0"} key={"0"}>已解决</Option>
                            <Option value={"1"} key={"1"}>未解决</Option>
                            <Option value={"2"} key={"2"}>无隐患</Option>
                        </Select>
                    </Col>
                    <Col style={{ textAlign: "right" }} span={4} push={12}>
                        <Button type="primary" className={publicstyle.button}
                            onClick={this.queryProfitOfCondition.bind(this)}>查询</Button>
                        <Button type="default" className={publicstyle.cancelbutton} style={{ marginLeft: "20px" }}
                            onClick={this.reset}>重置</Button>
                    </Col>
                </Row>
            </div>
        );
    }

    render() {
        const columns = [{
            title: '序号',
            dataIndex: 'odrder',
            className: publicstyle.center
        }, {
            title: '项目',
            dataIndex: 'name',
            className: publicstyle.center
        },
        {
            title: '检查对象',
            dataIndex: 'checkSortName',
            className: publicstyle.center,
        }, {
            title: '检查单位',
            dataIndex: 'checkMsaName',
            className: publicstyle.center
        }, {
            title: '隐患',
            dataIndex: 'danger',
            className: publicstyle.center,
        }, {
            title: '是否解决',
            dataIndex: 'isSolve',
            className: publicstyle.center,
            render: (text, record, index) => {
                if (record.isSolve == "0") {
                    return <Tag color="cyan">已解决</Tag>
                } else if (record.isSolve == "1") {
                    return <Tag color="orange">未解决</Tag>
                } else {
                    return "--"
                }
            },
        }, {
            title: '上传时间',
            dataIndex: 'publishTime',
            className: publicstyle.center
        },
            // {
            //     title: '操作',
            //     dataIndex: 'action',
            //     className: publicstyle.center,
            //     render: (text, record, index) => {
            //         return <div className={`${publicstyle.left}`}>
            //             <Button type="primary" style={{marginRight: 10}}
            //                     onClick={this.printIt.bind(this, record)}>详情</Button>
            //         </div>
            //     },
            // }
        ];

        return (
            <div className={stylez.wrapPadding}>
                <Spin spinning={this.state.loading} className={styles2.magin}>
                    <Breadcrumb separator=">">
                        <Breadcrumb.Item>检查单统计</Breadcrumb.Item>
                        <Breadcrumb.Item><Link to="main/specialExamination">专项检查</Link></Breadcrumb.Item>
                        <Breadcrumb.Item>查看</Breadcrumb.Item>
                    </Breadcrumb>
                    <div className={publicstyle.clearfloat}></div>
                    <Button type="primary" onClick={this.back} className={styles2.returnbackbutton}>返回</Button>

                    {this.renderForm()}
                    {/*页码*/}
                    {this.state.data && this.state.page ?
                        <div>
                            <Table columns={columns} dataSource={this.state.data} bordered={true} pagination={false}
                                style={{ textAlign: "center" }} />
                            <div className={styles.pageFlex}>
                                <span className={styles.pageWrap}>
                                    <Button type="primary" className={styles.pageFirst}
                                        style={{ display: this.state.page.pages > 0 ? "block" : "none", float: "left" }}
                                        onClick={this.toFirst.bind(this)}>首页</Button>
                                    <Pagination className={styles.page}
                                        style={{ display: this.state.page.pages > 0 ? "flex" : "none", float: "left" }}
                                        onChange={this.onPageChange.bind(this)} showFISRT
                                        current={this.state.current}
                                        pageSize={this.state.page.pageSize} total={this.state.page.total} />
                                    <Button type="primary" className={styles.pageLast}
                                        style={{ display: this.state.page.pages > 0 ? "block" : "none", float: "left" }}
                                        onClick={this.toLast.bind(this)}>末页</Button>
                                </span>

                            </div>
                        </div> : <div></div>}
                </Spin>
            </div>
        )
    }


}
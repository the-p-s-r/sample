import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch } from "../hooks/redux-hooks";
import CommonHelper from 'helpers/Common.Helper';
import styles from './DataGrid.module.css';
import { IGridAction, IGridColumn, TGeneric } from 'models/grid-model';

interface IDataGridProps {
    columns: Array<IGridColumn>;
    data: Array<TGeneric>,
    showHeader?: boolean;
    showDynamicActions?: boolean;
    actions?: Array<IGridAction>;
    noDataFoundMsg?: React.ReactNode | string;
    containerClass?: string;
    onSort?(column: string): void;
    onRowClick?(row: TGeneric, rowIndex: number): void;
    onMenuClick?(row: TGeneric, rowIndex: number): void;
    getMenuItemsByRow?(row: TGeneric, rowIndex: number): Array<IGridAction>;
}
const DataGrid = ({
    columns, data, showHeader, showDynamicActions,
    actions, noDataFoundMsg, containerClass,
    getMenuItemsByRow, onRowClick, onSort,
    onMenuClick
}: IDataGridProps) => {
    const [gridData, setGridData] = useState<Array<TGeneric>>([]);
    const [sortColumn, setSortColumn] = useState('');
    const [sortDirection, setSortDirection] = useState('');
    const menuRefs = useRef([]);
    const [activeMenuIndex, setActiveMenuIndex] = useState(null);
    const dispatch = useAppDispatch();

    const handleActionClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, entity:any , index: number) => {
        event.preventDefault();
        if (activeMenuIndex !== null) {
            event.stopPropagation();
            return;
        }
        setActiveMenuIndex(index === activeMenuIndex ? null : index);
        onMenuClick && onMenuClick(entity, index);
    };
    const handleMenuItemClick = (entity, index) => {
        setActiveMenuIndex(null);
    };
    const renderActionMenu = (entity: TGeneric, index: number): JSX.Element => {
        return (
            <div className="import-menu" ref={(ref) => (menuRefs.current[index] = ref)}>
                <ul>
                    {(getMenuItemsByRow(entity, index) || actions).map((action, menuItemIndex) => {
                        return (
                            <li
                                key={`menu-item-${index + 1}${menuItemIndex + 1}`}
                                onClick={() => {
                                    action.onClick && action.onClick(entity, index);
                                    handleMenuItemClick(entity, index);
                                }}
                            >
                                {action.menu}
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    };
    const renderHeader = (columns: Array<IGridColumn>, actions: Array<IGridAction>) => {
        return (
            <thead>
                <tr>
                    {columns.map(column => {
                        const icon = (
                            sortColumn === column.dbColumn ?
                                sortDirection === 'ASC' ?
                                <i className="fa-solid fa-arrow-up" style={{ color: '#657694' }}></i> :
                                <i className="fa-solid fa-arrow-down" style={{ color: '#657694' }}></i> :
                            <span className="grey_box mr-2 my-0 "></span>
                        );
                        const header = <><span>{column.label || CommonHelper.ucFirst(column.dbColumn)}</span> {icon}</>;

                        return (<th scope="col" key={column.dbColumn}>
                            {
                                column.label !== null ?
                                    column.sortable ?
                                <a
                                    href="#"
                                    style={{ textDecoration: 'none' }}
                                    onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
                                        event.preventDefault();
                                        event.stopPropagation();

                                        const sortDir = (
                                            !sortDirection ?
                                            'ASC' :
                                            sortDirection === 'ASC' ? 'DESC' : ''
                                        );

                                        setSortDirection(sortDir);
                                        if (sortDir) {
                                            setSortColumn(column.dbColumn);
                                            setGridData(gridData => gridData.sort((entity1, entity2) => {
                                                const negate = sortDir === 'ASC' ? -1 : 1;

                                                return (
                                                    entity1[column.dbColumn] === entity2[column.dbColumn] ? 0 :
                                                    entity1[column.dbColumn] > entity2[column.dbColumn] ? negate * 1 :
                                                    negate * -1
                                                );
                                            }));
                                            onSort && onSort(column.dbColumn);
                                        } else {
                                            setSortColumn('');
                                        }
                                    }}
                                >
                                    {header}
                                </a> :
                                header :
                                <></>
                            }{" "}
                        </th>);
                    })}
                    {(Array.isArray(actions) || showDynamicActions) &&
                    <th scope="col">
                        <span>Actions</span> <span className="grey_box mr-2 my-0 "></span>
                    </th>}
                </tr>
            </thead>
        );
    };
    const renderEmptyBody = (columns: Array<IGridColumn>, actions: Array<IGridAction>) => {
        return (
            <tbody>
                <tr>
                    <td colSpan={columns.length + (Array.isArray(actions) || showDynamicActions ? 1 : 0)} align="center"> {noDataFoundMsg || ''} </td>
                </tr>
            </tbody>
        );
    };
    const renderBody = (data: Array<TGeneric>, columns: Array<IGridColumn>, actions: Array<IGridAction>) => {
        return (
            <tbody>
                {data.map((entity, index) => (
                    <tr key={index}>
                        {columns.map(({ dbColumn, renderer, clickable }: IGridColumn) => {
                            return (<td key={`${dbColumn}-${index}`}>
                                {
                                    typeof renderer === 'function' ?
                                    <>{renderer(entity[dbColumn], index, entity)}</> :
                                    clickable === true ?
                                    <a
                                        className={styles['clickable']}
                                        href="#"
                                        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            if (typeof onRowClick === 'function') {
                                                onRowClick(entity, index)
                                            }
                                        }}
                                    >
                                        {entity[dbColumn]}
                                    </a> :
                                    <span>{entity[dbColumn]}</span>
                                }
                            </td>);
                        })}
                        {(Array.isArray(actions) || showDynamicActions) &&
                        <td>
                            <span id="actions" className="position-relative">
                                <a href="#" onClick={(event) => handleActionClick(event, entity, index)}>
                                    <i className="fa-solid fa-ellipsis-vertical"></i>
                                </a>
                                {activeMenuIndex === index && renderActionMenu(entity, index)}
                            </span>
                        </td>
                        }
                    </tr>
                ))}
            </tbody>
        );
    };

    useEffect(() => {
        setGridData(data);
    }, [data]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            for (let i = 0; i < menuRefs.current.length; i++) {
                if (menuRefs.current[i] && !menuRefs.current[i].contains(event.target)) {
                    setActiveMenuIndex(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        gridData.length > 0 ?
        <div className={`table-responsive ${styles['status_table']}${containerClass ? ` ${containerClass}`: ''}`}>
            <table className="table table-borderless">
                {renderHeader(columns, actions)}
                {renderBody(gridData, columns, actions)}
            </table>
        </div> : (
            showHeader === true ?
            <div className={`table-responsive ${styles['status_table']}${containerClass ? ` ${containerClass}`: ''}`}>
                <table className="table table-borderless">
                    {renderHeader(columns, actions)}
                    {renderEmptyBody(columns, actions)}
                </table>
            </div> :
            <>{noDataFoundMsg || ''}</>
        )
    );
};

export default DataGrid;

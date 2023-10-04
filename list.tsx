const columns: Array<IGridColumn> = [{
        dbColumn: 'loaderSystem',
        sortable: true,
        label: 'Loader System',
    }, {
        dbColumn: 'displayName',
        sortable: true,
        label: 'Display Name'
    }, {
        dbColumn: 'test2',
        sortable: true,
        label: 'test2 Number'
    }, {
        dbColumn: 'test1',
        sortable: true,
        label: 'Status',
        renderer: (lsapFileStatus: string) => {
            return (<>
                <span
                    className="grey_circle"
                    style={{
                        background:
                        lsapFileStatus === "ACTIVE" || lsapFileStatus === 'COMPLETED'
                                        ? "#06BE0D"
                                        : lsapFileStatus === "ERROR" || lsapFileStatus === "DELETED"
                                        ? "#FF3535"
                                        : lsapFileStatus === "QUEUED" || lsapFileStatus === "INACTIVE"
                                        ? "#3D4F6E"
                                        : lsapFileStatus === "PROCESSING"
                                        ? "#FFAE35"
                                        : lsapFileStatus === "SUBMITTED"
                                        ? "#989898"
                                        : "default"
                    }}
                ></span>
                <span>{lsapFileStatus}</span>
                <span style={{ display: lsapFileStatus === 'Error' ? 'inline-block' : 'none', color: '#1792E5', margin: '0px 5px' }}>
                    <OverlayTrigger
                        placement="bottom"
                        overlay={<Tooltip id="my-tooltip" className="custom-tooltip"><div className="tooltip-content">{errorMessage}</div></Tooltip>}
                    >
                        <span style={{ fontSize: '12px', cursor: 'pointer', color: '#1792E5' }}>
                            <i className="fa-regular fa-circle-question"></i>
                        </span>
                    </OverlayTrigger>
                </span>
            </>);
        }
    }];

    const gridConfig = { columns, data: sortedData, showHeader: true, noDataFoundMsg: 'No data found!!' };

    return (
        <>
            <div>
                {/* search_nav */}
                <nav className="navbar navbar-expand-lg bg-body-tertiary search_nav" data-testid="search-nav">
                    <div className="container-fluid p-0" data-testid="outer-div">
                        <form className="d-flex position-relative" role="search" data-testid="form-container">
                            <input
                                type="search"
                                name="name"
                                className="form-control filter_box me-2"

                                value={filter}
                                onChange={handleSearch}
                                placeholder="Search files by FileType , Part Number"
                                aria-label="Search"
                            />
                            <i className="fa-solid fa-magnifying-glass search_icon"></i>
                        </form>
                        <ButtonPanel { ...buttonPanelConfig }></ButtonPanel>
                    </div>
                </nav>

                {/* Job detail page dataTable */}
                <DataGrid { ...gridConfig }></DataGrid>
            </div>
            <Footer />
        </>
    );

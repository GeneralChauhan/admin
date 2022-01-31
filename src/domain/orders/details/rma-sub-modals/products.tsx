import { useAdminVariants } from "medusa-react"
import React, { useContext, useEffect, useMemo, useState } from "react"
import Button from "../../../../components/fundamentals/button"
import Modal from "../../../../components/molecules/modal"
import { LayeredModalContext } from "../../../../components/molecules/modal/layered-modal"
import Table, { TablePagination } from "../../../../components/molecules/table"
import { useTable, usePagination, useRowSelect } from "react-table"
import StatusIndicator from "../../../../components/fundamentals/status-indicator"
import { useDebounce } from "../../../../hooks/use-debounce"
import CheckIcon from "../../../../components/fundamentals/icons/check-icon"
import clsx from "clsx"

const getProductStatusVariant = (status) => {
  switch (status) {
    case "proposed":
      return "warning"
    case "published":
      return "success"
    case "rejected":
      return "danger"
    case "draft":
    default:
      return "default"
  }
}

type RMASelectProductSubModalProps = {
  onSubmit: (selectItems) => void
  selectedItems?: any
  isLargeModal?: boolean
}

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, className, checked, ...rest }, ref) => {
    const defaultRef = React.useRef()
    const resolvedRef = ref || defaultRef

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate
    }, [resolvedRef, indeterminate])

    return (
      <div className="items-center h-full flex">
        <div
          onClick={() => resolvedRef.current?.click()}
          className={`w-5 h-5 flex justify-center text-grey-0 border-grey-30 border cursor-pointer rounded-base ${
            checked && "bg-violet-60"
          }`}
        >
          <span className="self-center">
            {checked && <CheckIcon size={16} />}
          </span>
        </div>
        <input
          type="checkbox"
          className={clsx("hidden", className)}
          ref={resolvedRef}
          {...rest}
        />
      </div>
    )
  }
)

const RMASelectProductSubModal: React.FC<RMASelectProductSubModalProps> = ({
  onSubmit,
  selectedItems,
  isLargeModal = true,
}) => {
  const { pop } = useContext(LayeredModalContext)
  const [query, setQuery] = useState("")
  const [limit, setLimit] = useState(5)
  const [offset, setOffset] = useState(0)
  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)

  const [selectedVariants, setSelectedVariants] = useState<any[]>([])

  const debouncedSearchTerm = useDebounce(query, 500)

  const { isLoading, count, variants } = useAdminVariants({
    q: debouncedSearchTerm,
    limit: limit,
    offset,
  })

  useEffect(() => {
    if (typeof count !== "undefined") {
      setNumPages(Math.ceil(count / limit))
    }
  }, [count])

  const columns = useMemo(() => {
    return [
      {
        Header: "Name",
        accessor: "title",
        Cell: ({ row: { original } }) => {
          return (
            <div className="flex items-center">
              <div className="h-[40px] w-[30px] my-1.5 flex items-center mr-4">
                {original.product.thumbnail ? (
                  <img
                    src={original.product.thumbnail}
                    className="h-full object-cover rounded-soft"
                  />
                ) : (
                  <></>
                )}
              </div>
              <div className="flex flex-col">
                <span>{original.product.title}</span>
                {original.title}
              </div>
            </div>
          )
        },
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ row: { original } }) => (
          <StatusIndicator
            title={`${original.product.status
              .charAt(0)
              .toUpperCase()}${original.product.status.slice(1)}`}
            variant={getProductStatusVariant(original.product.status)}
          />
        ),
      },
      {
        Header: <div className="text-right">In Stock</div>,
        accessor: "inventory_quantity",
        Cell: ({ row: { original } }) => (
          <div className="text-right">{original.inventory_quantity}</div>
        ),
      },
    ]
  }, [])

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageCount,
    nextPage,
    previousPage,
    // Get the state from the instance
    state: { pageIndex, pageSize, selectedRowIds },
  } = useTable(
    {
      columns,
      data: variants || [],
      manualPagination: true,
      initialState: {
        pageIndex: currentPage,
        pageSize: limit,
        selectedRowIds: selectedItems.reduce((prev, { id }) => {
          prev[id] = true
          return prev
        }, {}),
      },
      pageCount: numPages,
      autoResetSelectedRows: false,
      autoResetPage: false,
      getRowId: (row) => row.id,
    },
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        // Let's make a column for selection
        {
          id: "selection",
          // The header can use the table's getToggleAllRowsSelectedProps method
          // to render a checkbox
          Header: ({ getToggleAllRowsSelectedProps }) => {
            return (
              <div>
                <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
              </div>
            )
          },
          // The cell can use the individual row's getToggleRowSelectedProps method
          // to the render a checkbox
          Cell: ({ row }) => {
            return (
              <div>
                <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
              </div>
            )
          },
        },
        ...columns,
      ])
    }
  )

  useEffect(() => {
    setSelectedVariants((selectedVariants) => [
      ...selectedVariants.filter(
        (sv) => Object.keys(selectedRowIds).findIndex((id) => id === sv.id) > -1
      ),
      ...(variants?.filter(
        (v) =>
          selectedVariants.findIndex((sv) => sv.id === v.id) < 0 &&
          Object.keys(selectedRowIds).findIndex((id) => id === v.id) > -1
      ) || []),
    ])
  }, [selectedRowIds])

  const handleNext = () => {
    if (canNextPage) {
      setOffset((old) => old + pageSize)
      setCurrentPage((old) => old + 1)
      nextPage()
    }
  }

  const handlePrev = () => {
    if (canPreviousPage) {
      setOffset((old) => old - pageSize)
      setCurrentPage((old) => old - 1)
      previousPage()
    }
  }

  const handleSearch = (q) => {
    setOffset(0)
    setCurrentPage(0)
    setQuery(q)
  }

  const handleSubmit = () => {
    onSubmit(selectedVariants)
    pop()
  }

  return (
    <>
      <Modal.Content isLargeModal={isLargeModal}>
        <div className="h-full">
          <h2 className="inter-base-semibold mb-4">Search for additional </h2>
        </div>
        <Table enableSearch handleSearch={handleSearch} {...getTableProps()}>
          <Table.Head>
            {headerGroups.map((headerGroup) => (
              <Table.HeadRow {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <Table.HeadCell {...column.getHeaderProps()}>
                    {column.render("Header")}
                  </Table.HeadCell>
                ))}
              </Table.HeadRow>
            ))}
          </Table.Head>
          <Table.Body {...getTableBodyProps()}>
            {rows.map((row, i) => {
              prepareRow(row)
              return (
                <Table.Row {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <Table.Cell {...cell.getCellProps()}>
                        {cell.render("Cell")}
                      </Table.Cell>
                    )
                  })}
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
        <TablePagination
          count={count!}
          limit={limit}
          offset={offset}
          pageSize={offset + rows.length}
          title="Products"
          currentPage={pageIndex}
          pageCount={pageCount}
          nextPage={handleNext}
          prevPage={handlePrev}
          hasNext={canNextPage}
          hasPrev={canPreviousPage}
        />
      </Modal.Content>
      <Modal.Footer isLargeModal={isLargeModal}>
        <div className="flex w-full justify-end gap-x-xsmall">
          <Button
            variant="ghost"
            size="small"
            className="w-[112px]"
            onClick={() => pop()}
          >
            Back
          </Button>
          <Button
            variant="primary"
            className="w-[112px]"
            size="small"
            onClick={handleSubmit}
          >
            Add
          </Button>
        </div>
      </Modal.Footer>
    </>
  )
}

export default RMASelectProductSubModal

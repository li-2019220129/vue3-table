import type { PropType } from 'vue'
import { defineComponent, ref, computed, useAttrs } from 'vue'

const Comp = defineComponent(
  (props) => {
    return () => {
      const getType = (item: Record<string, any>) => {
        return item.type || 'default'
      }
      const attrs = useAttrs()
      return (
        <div class="table-class">
          <el-table data={props.tableData} style={{ width: '100%' }} {...attrs}>
            {props.col.map((item: Record<string, any>) => {
              return (
                <el-table-column
                  type={getType(item)}
                  prop={item.property}
                  label={item.label}
                  sortable={item.sortable}
                  fixed={item.fixed}
                  show-overflow-tooltip={item.showOverflowTooltip}
                  width={item.width}
                  min-width={item.minWidth}
                  v-slots={{
                    default: item.slot?.default,
                    header: item.slot?.header
                  }}
                ></el-table-column>
              )
            })}
          </el-table>
        </div>
      )
    }
  },
  {
    props: {
      tableData: {
        type: Array as PropType<Record<string, any>[]>,
        default: () => []
      },
      col: {
        type: Array as PropType<Record<string, any>[]>,
        default: () => []
      }
    }
  }
)
export default Comp

<?php
require_once '../vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\ReferenceHelper;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\Cell;

class PhpSpreadsheetManager {
    protected $_ = array(
    );
    protected $fileType = array(
    		"xls" => "xls",
    		"xlsx" => "xlsx",
    		"pdf" => "pdf"
    );
    
    public $isTemplate;
	public $outputAsFileType;
    public $filename;
    
    protected $templateName;
    protected $templateExtension;
    protected $templateLocation;
    protected $isTemplateExists;
    protected $spreadsheet;

    protected $columnAMapping;

	protected $filenamePost;
	protected $table = "";
	protected $tableList = array();
	protected $excelSheetsHeader = array();

	//public $isExportSequencedColumnOnly = true; // true, export the columns which are defined sequence by user
	protected $processMessageList = array();

	private $customizeExportColumnSequence = array();
	private $skipExportColumnScheme = array();
	private $proposedExportColumnSequence = array();

	private $currentWorkSheetIndex = -1;
    
    function __construct($templateName="") {
        $templateFileName = pathinfo($templateName, PATHINFO_FILENAME);
        $templateFileExtension = pathinfo($templateName, PATHINFO_EXTENSION);

        $this->templateName = $templateFileName;
        $this->templateExtension = $templateFileExtension;
    }
	function Initialize(){
        $isInitializeSuccess = true;
        // $this->isTemplateExists = $this->GetTemplateLocation() != "";
        
        $this->LoadTemplate();
        $this->ReadMappping();
        $isInitializeSuccess = $isInitializeSuccess && $this->CheckMappping();
        $isInitializeSuccess = $isInitializeSuccess && $this->CheckIsTemplateExists();

        $this->SetExportFileLocation();

		// $this->filename = $this->table."_Export_Excel_" . date('Y-m-d_His');
        $this->outputAsFileType = $this->fileType["xlsx"];
        
		return $isInitializeSuccess;
    }

    function CheckIsTemplateExists(){
        return $this->isTemplateExists;
    }
    function LoadTemplate(){
        $this->isTemplateExists = false;
        $_templateLocation = __DIR__."/../Templates/report/".$this->GetTemplateName();

        $this->SetTemplateLocation("");
        if(file_exists($_templateLocation)){
            $this->isTemplateExists = true;
            $this->SetTemplateLocation($_templateLocation);
        }

        $this->CreateSpreadsheet();
    }
    function ReadMappping(){
        $this->columnAMapping = new stdClass();
        $this->columnAMapping->Indicator = new stdClass();
        $this->columnAMapping->PrintedTimes = new stdClass();
        $this->columnAMapping->ShiftedTemplateRowPosition = new stdClass();
        $this->columnAMapping->ShiftedTemplateMergePosition = new stdClass();
        $this->columnAMapping->Group = array();
        $worksheet = $this->GetSpreadsheet()->getActiveSheet();
        // foreach ($worksheet->getRowIterator() as $row) {
        //     // By default, only cells that have a value set will be iterated.
        //     $cellIterator = $row->getCellIterator();

        //     // This loops through all cells, even if a cell value is not set.
        //     //$cellIterator->setIterateOnlyExistingCells(FALSE);

        //     foreach ($cellIterator as $cell) {
        //             print_r($cell->getValue());
        //     }
        // }
        
        // Get the highest row and column numbers referenced in the worksheet
        $highestRow = $worksheet->getHighestRow(); // e.g. 10
        $highestColumn = $worksheet->getHighestColumn(); // e.g 'F'
        $highestColumnIndex = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($highestColumn); // e.g. 5

        for ($rowIndex = 1; $rowIndex <= $highestRow; $rowIndex++) {
            // for ($colIndex = 1; $colIndex <= $highestColumnIndex; $colIndex++) {
            // }
            
            // read column A only
            $cellValue = $worksheet->getCellByColumnAndRow(1, $rowIndex)->getValue();

            $isIndicatorValid = true;
            // is indicator valid
            if(!is_null($cellValue) && !empty($cellValue)){
                $length = strlen($cellValue);
                if($length == 1){
                    if(!ctype_alpha($cellValue)){
                        $isIndicatorValid = false;
                    }
                }else if($length >= 2){
                    if(!ctype_alpha(substr($cellValue, 0, 1))){
                        $isIndicatorValid = false;
                    }
                }
            }else{
                $isIndicatorValid = false;
            }

            // if invalid, read next row
            if(!$isIndicatorValid) continue;

            $indicatorCharacter = strtoupper($cellValue);

            if(!isset($this->columnAMapping->Indicator->$indicatorCharacter)){
                $this->columnAMapping->Indicator->$indicatorCharacter = array();
                $this->columnAMapping->PrintedTimes->$indicatorCharacter = 0;
                $this->columnAMapping->ShiftedTemplateRowPosition->$indicatorCharacter = array();
                $this->columnAMapping->ShiftedTemplateMergePosition->$indicatorCharacter = array();
            }
            array_push($this->columnAMapping->Indicator->$indicatorCharacter, $rowIndex);
            array_push($this->columnAMapping->ShiftedTemplateRowPosition->$indicatorCharacter, $rowIndex);
            array_push($this->columnAMapping->ShiftedTemplateMergePosition->$indicatorCharacter, $rowIndex+1);
        }
    }
    function CheckMappping(){
        $isValid = true;
        $isHContinuously = true;
        $isFContinuously = true;

        // check if 'H' is exists
        if(property_exists($this->columnAMapping->Indicator, "H")){
            // check if 'H' is not continuously
            if(!$isHContinuously){
                // warning if not continuously
            }else{
                $this->InitializeHeader();
            }
        }

        // check if 'F' is exists
        // if(property_exists($this->columnAMapping->Indicator, "F")){
        //     // check if 'F' is not continuously
        //     // warning if not continuously
        //     if(!$isFContinuously){
        //         // warning if not continuously
        //     }else{
        //         $this->InitializeFooter();
        //     }
        // }else{
        // }
        
        // Unfortunately, Excel not allow repeat footer by rows
        // I think if repeat by rows, that unable to control the rows may break to the next page.
        // $this->InitializeFooter();

        $isValid = $isValid && $isHContinuously;
        $isValid = $isValid && $isFContinuously;

        return $isValid;
    }
    function InitializeHeader(){
        $spreadsheet = $this->GetSpreadsheet();

        $headerStartRowIndex = $this->columnAMapping->Indicator->H[0];
        $headerEndRowIndex = end($this->columnAMapping->Indicator->H);

        // set row 1-5 repeat as header for printing
        $spreadsheet->getActiveSheet()->getPageSetup()->setRowsToRepeatAtTopByStartAndEnd($headerStartRowIndex, $headerEndRowIndex);
    }
    function InitializeFooter(){
        $spreadsheet = $this->GetSpreadsheet();
        // set page number repeat as footer for printing
        $spreadsheet->getActiveSheet()->getHeaderFooter()->setOddFooter("&LReport ID:" . $spreadsheet->getProperties()->getTitle() . "\nPrint Time: ".date("d/m/Y H:i")." &RPage &P of &N");
    }

    // https://stackoverflow.com/questions/34590622/copy-style-and-data-in-phpexcel
    function CopyRange(Worksheet $sheet, $srcRange, $dstCell) {
        // Validate source range. Examples: A2:A3, A2:AB2, A27:B100
        if( !preg_match('/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/', $srcRange, $srcRangeMatch) ) {
            // Wrong source range
            return;
        }
        // Validate destination cell. Examples: A2, AB3, A27
        if( !preg_match('/^([A-Z]+)(\d+)$/', $dstCell, $destCellMatch) ) {
            // Wrong destination cell
            return;
        }

        $srcColumnStart = $srcRangeMatch[1];
        $srcRowStart = $srcRangeMatch[2];
        $srcColumnEnd = $srcRangeMatch[3];
        $srcRowEnd = $srcRangeMatch[4];

        $destColumnStart = $destCellMatch[1];
        $destRowStart = $destCellMatch[2];

        // For looping purposes we need to convert the indexes instead
        // Note: We need to subtract 1 since column are 0-based and not 1-based like this method acts.

        $srcColumnStart = Cell::columnIndexFromString($srcColumnStart) - 1;
        $srcColumnEnd = Cell::columnIndexFromString($srcColumnEnd) - 1;
        $destColumnStart = Cell::columnIndexFromString($destColumnStart) - 1;

        $rowCount = 0;
        for ($row = $srcRowStart; $row <= $srcRowEnd; $row++) {
            $colCount = 0;
            for ($col = $srcColumnStart; $col <= $srcColumnEnd; $col++) {
                $cell = $sheet->getCellByColumnAndRow($col, $row);
                $style = $sheet->getStyleByColumnAndRow($col, $row);
                $dstCell = Cell::stringFromColumnIndex($destColumnStart + $colCount) . (string)($destRowStart + $rowCount);
                $sheet->setCellValue($dstCell, $cell->getValue());
                $sheet->duplicateStyle($style, $dstCell);

                // Set width of column, but only once per row
                if ($rowCount === 0) {
                    $w = $sheet->getColumnDimensionByColumn($col)->getWidth();
                    $sheet->getColumnDimensionByColumn ($destColumnStart + $colCount)->setAutoSize(false);
                    $sheet->getColumnDimensionByColumn ($destColumnStart + $colCount)->setWidth($w);
                }

                $colCount++;
            }

            $h = $sheet->getRowDimension($row)->getRowHeight();
            $sheet->getRowDimension($destRowStart + $rowCount)->setRowHeight($h);

            $rowCount++;
        }

        foreach ($sheet->getMergeCells() as $mergeCell) {
            $mc = explode(":", $mergeCell);
            $mergeColSrcStart = Cell::columnIndexFromString(preg_replace("/[0-9]*/", "", $mc[0])) - 1;
            $mergeColSrcEnd = Cell::columnIndexFromString(preg_replace("/[0-9]*/", "", $mc[1])) - 1;
            $mergeRowSrcStart = ((int)preg_replace("/[A-Z]*/", "", $mc[0]));
            $mergeRowSrcEnd = ((int)preg_replace("/[A-Z]*/", "", $mc[1]));

            $relativeColStart = $mergeColSrcStart - $srcColumnStart;
            $relativeColEnd = $mergeColSrcEnd - $srcColumnStart;
            $relativeRowStart = $mergeRowSrcStart - $srcRowStart;
            $relativeRowEnd = $mergeRowSrcEnd - $srcRowStart;

            if (0 <= $mergeRowSrcStart && $mergeRowSrcStart >= $srcRowStart && $mergeRowSrcEnd <= $srcRowEnd) {
                $targetColStart = Cell::stringFromColumnIndex($destColumnStart + $relativeColStart);
                $targetColEnd = Cell::stringFromColumnIndex($destColumnStart + $relativeColEnd);
                $targetRowStart = $destRowStart + $relativeRowStart;
                $targetRowEnd = $destRowStart + $relativeRowEnd;

                $merge = (string)$targetColStart . (string)($targetRowStart) . ":" . (string)$targetColEnd . (string)($targetRowEnd);
                //Merge target cells
                $sheet->mergeCells($merge);
            }
        }
    }

    // https://stackoverflow.com/questions/34590622/copy-style-and-data-in-phpexcel
    function CopyRows( Worksheet $sheet, $srcRange, $dstCell, Worksheet $destSheet = null) {

        if( !isset($destSheet)) {
            $destSheet = $sheet;
        }

        if( !preg_match('/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/', $srcRange, $srcRangeMatch) ) {
            // Invalid src range
            return;
        }

        if( !preg_match('/^([A-Z]+)(\d+)$/', $dstCell, $destCellMatch) ) {
            // Invalid dest cell
            return;
        }

        $srcColumnStart = $srcRangeMatch[1];
        $srcRowStart = $srcRangeMatch[2];
        $srcColumnEnd = $srcRangeMatch[3];
        $srcRowEnd = $srcRangeMatch[4];

        $destColumnStart = $destCellMatch[1];
        $destRowStart = $destCellMatch[2];

        $srcColumnStart = Coordinate::columnIndexFromString($srcColumnStart);
        $srcColumnEnd = Coordinate::columnIndexFromString($srcColumnEnd);
        $destColumnStart = Coordinate::columnIndexFromString($destColumnStart);

        $rowCount = 0;
        for ($row = $srcRowStart; $row <= $srcRowEnd; $row++) {
            $colCount = 0;
            for ($col = $srcColumnStart; $col <= $srcColumnEnd; $col++) {
                $cell = $sheet->getCellByColumnAndRow($col, $row);
                $style = $sheet->getStyleByColumnAndRow($col, $row);
                $dstCell = Coordinate::stringFromColumnIndex($destColumnStart + $colCount) . (string)($destRowStart + $rowCount);

                // get cell value
                $cellValue = $cell->getValue();

                // Start - update the formula reference
                // check is formula
                $isFormula = false;
                if(substr($cellValue,0, 1) == "="){
                    $isFormula = true;
                }

                // update reference
                if($isFormula){
                    $referenceHelper = ReferenceHelper::getInstance();
                    $sourceRow = explode(":", $srcRange)[0];

                    $referenceCoordinate = $sourceRow;

                    $rowsDifference = intval(substr($dstCell,1)) - substr($sourceRow,1);

                    $adjustedFormula = $referenceHelper->updateFormulaReferences($cellValue, $referenceCoordinate, 0, $rowsDifference);
                    // print_r("sourceRow: ".$sourceRow. PHP_EOL);
                    // print_r("rowsDifference: ".$rowsDifference. PHP_EOL);
                    // print_r("referenceCoordinate: ".$referenceCoordinate. PHP_EOL);
                    // print_r("cellValue: ".$cellValue. PHP_EOL);
                    // print_r("adjustedFormula: ".$adjustedFormula.PHP_EOL);

                    $cellValue = $adjustedFormula;
                }
                // End 

                $destSheet->setCellValue($dstCell, $cellValue);
                $destSheet->duplicateStyle($style, $dstCell);

                // Set width of column, but only once per column
                if ($rowCount === 0) {
                    $w = $sheet->getColumnDimensionByColumn($col)->getWidth();
                    $destSheet->getColumnDimensionByColumn ($destColumnStart + $colCount)->setAutoSize(false);
                    $destSheet->getColumnDimensionByColumn ($destColumnStart + $colCount)->setWidth($w);
                }

                $colCount++;
            }

            $h = $sheet->getRowDimension($row)->getRowHeight();
            $destSheet->getRowDimension($destRowStart + $rowCount)->setRowHeight($h);

            $rowCount++;
        }

        // handle merged cells
        foreach ($sheet->getMergeCells() as $mergeCell) {
            $mc = explode(":", $mergeCell);
            $mergeColSrcStart = Coordinate::columnIndexFromString(preg_replace("/[0-9]*/", "", $mc[0]));
            $mergeColSrcEnd = Coordinate::columnIndexFromString(preg_replace("/[0-9]*/", "", $mc[1]));
            $mergeRowSrcStart = ((int)preg_replace("/[A-Z]*/", "", $mc[0]));
            $mergeRowSrcEnd = ((int)preg_replace("/[A-Z]*/", "", $mc[1]));

            $relativeColStart = $mergeColSrcStart - $srcColumnStart;
            $relativeColEnd = $mergeColSrcEnd - $srcColumnStart;
            $relativeRowStart = $mergeRowSrcStart - $srcRowStart;
            $relativeRowEnd = $mergeRowSrcEnd - $srcRowStart;

            if (0 <= $mergeRowSrcStart && $mergeRowSrcStart >= $srcRowStart && $mergeRowSrcEnd <= $srcRowEnd) {
                $targetColStart = Coordinate::stringFromColumnIndex($destColumnStart + $relativeColStart);
                $targetColEnd = Coordinate::stringFromColumnIndex($destColumnStart + $relativeColEnd);
                $targetRowStart = $destRowStart + $relativeRowStart;
                $targetRowEnd = $destRowStart + $relativeRowEnd;

                $merge = (string)$targetColStart . (string)($targetRowStart) . ":" . (string)$targetColEnd . (string)($targetRowEnd);
                //Merge target cells
                $destSheet->mergeCells($merge);
            }
        }
    }

    function MergeDataSets($_indicator, $_dataSets){

    }

    // shift template row position
    function PrintGroupInterval($_indicatorsList){
        $spreadsheet = $this->GetSpreadsheet();
        $worksheet = $this->GetSpreadsheet()->getActiveSheet();

        $highestColumn = $worksheet->getHighestColumn(); // e.g 'F'
        $highestColumnIndex = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($highestColumn);

        // 0. Check indicatoryArray
        $_indicatorArray = array();
        foreach($_indicatorsList as $indicatorIndex => $_indicator){
            if(!property_exists($this->columnAMapping->ShiftedTemplateMergePosition, $_indicator)){
                continue;
            }
            array_push($_indicatorArray, $_indicator);
        }

        // 1. find the bottom merged row position
        $bottomMergedRowPosition = 0;
        foreach($_indicatorArray as $indicatorIndex => $_indicator){
            $rowArray = $this->columnAMapping->ShiftedTemplateMergePosition->$_indicator;
            for($rowIndex = 0; $rowIndex < count($rowArray); $rowIndex++){
                $rowPosition = $rowArray[$rowIndex];
                if($rowPosition > $bottomMergedRowPosition){
                    $bottomMergedRowPosition = $rowPosition;
                }
            }
        }

        // 2. in original, find the top template row position
        // find the involved indicator order
        $topTemplateRow = 0;
        $indicatorOrder = array();
        foreach($_indicatorArray as $indicatorIndex => $_indicator){
            $rowArray = $this->columnAMapping->ShiftedTemplateMergePosition->$_indicator;
            $rowPosition = $rowArray[0];
            // assign row number to variable on first time
            if($topTemplateRow == 0){
                $topTemplateRow = $rowPosition;
                array_unshift($indicatorOrder, $_indicator);
            }else if($topTemplateRow > $rowPosition){
                $topTemplateRow = $rowPosition;
                array_unshift($indicatorOrder, $_indicator);
            }else{
                array_push($indicatorOrder, $_indicator);
            }
        }

        // 3. find how many template rows needed to insert
        $countTemplateRows = 0;
        foreach($_indicatorArray as $indicatorIndex => $_indicator){
            $rowArray = $this->columnAMapping->ShiftedTemplateRowPosition->$_indicator;
            $countTemplateRows += count($rowArray);
        }

        // 3. insert the new row(s)
        $bottomRowNum = $bottomMergedRowPosition;
        $worksheet->insertNewRowBefore($bottomRowNum, $countTemplateRows);

        // 4. copy template cell value to newly inserted row
        $copiedTemplateRowDestination = array();
        $copyRowPositionPointer = $bottomRowNum;
        foreach($indicatorOrder as $orderIndex => $_indicator){
            $tempalteRowsArray = $this->columnAMapping->ShiftedTemplateRowPosition->$_indicator;
            foreach($tempalteRowsArray as $template_row_index => $template_row_positon){
                $this->CopyRows($worksheet, "A$template_row_positon:$highestColumn$template_row_positon", "A".($copyRowPositionPointer));

                array_push($copiedTemplateRowDestination, $copyRowPositionPointer);

                $copyRowPositionPointer++;
                // // shift rows in group
                // $tempalteRowsArray[$template_row_index] = $copyRowPositionPointer;
                // $this->columnAMapping->ShiftedTemplateRowPosition->$_indicator = $tempalteRowsArray;
                // $this->columnAMapping->ShiftedTemplateMergePosition->$_indicator = $tempalteRowsArray;
            }
        }

        // 5. shift rows in group
        
        // Get the highest row and column numbers referenced in the worksheet
        $highestRow = $worksheet->getHighestRow(); // e.g. 10
        $templateRowsShadow = new stdClass();
        $templateMergeShadow = new stdClass();

        for ($rowIndex = $bottomRowNum; $rowIndex <= $highestRow; $rowIndex++) {
            // read column A only
            $cellValue = $worksheet->getCellByColumnAndRow(1, $rowIndex)->getValue();

            $isIndicatorValid = true;
            // is indicator valid
            if(!is_null($cellValue) && !empty($cellValue)){
                $length = strlen($cellValue);
                if($length == 1){
                    if(!ctype_alpha($cellValue)){
                        $isIndicatorValid = false;
                    }
                }else if($length >= 2){
                    if(!ctype_alpha(substr($cellValue, 0, 1))){
                        $isIndicatorValid = false;
                    }
                }
            }else{
                $isIndicatorValid = false;
            }

            // if invalid, read next row
            if(!$isIndicatorValid) continue;

            $indicatorCharacter = strtoupper($cellValue);

            if(!isset($templateRowsShadow->$indicatorCharacter)){
                $templateRowsShadow->$indicatorCharacter = array();
                $templateMergeShadow->$indicatorCharacter = array();
            }

            array_push($templateRowsShadow->$indicatorCharacter, $rowIndex);
            array_push($templateMergeShadow->$indicatorCharacter, $rowIndex+1);
        }
        foreach($templateRowsShadow as $_indicator => $rowArray){
            $this->columnAMapping->ShiftedTemplateRowPosition->$_indicator = $templateRowsShadow->$_indicator;
            $this->columnAMapping->ShiftedTemplateMergePosition->$_indicator = $templateMergeShadow->$_indicator;
        }

        // print_r($this->columnAMapping->ShiftedTemplateRowPosition);
        // print_r($this->columnAMapping->ShiftedTemplateMergePosition);
    }

    function MergeDataSet($_indicator, $_dataSet){
        // is indicator exists
        if(!property_exists($this->columnAMapping->Indicator, $_indicator)){
            return;
        }

        $mergeRows = $this->columnAMapping->Indicator->$_indicator;
        $mergeRowsCount = count($mergeRows);

        $dataTableName = $_dataSet["tablename"];
        $dataSetRowCount = count($_dataSet["rows"]);

        $spreadsheet = $this->GetSpreadsheet();
        $worksheet = $this->GetSpreadsheet()->getActiveSheet();

        for($rowPointer=0; $rowPointer<$dataSetRowCount; $rowPointer++){
            $insertRowStartPosition = end($mergeRows)+1+($mergeRowsCount*$rowPointer);

            $highestColumn = $worksheet->getHighestColumn(); // e.g 'F'
            $highestColumnIndex = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($highestColumn);

            // insert new rows
            // $spreadsheet->getActiveSheet()->insertNewRowBefore($insertRowPosition, $mergeRowsCount);

            // copy template rows from bottom
            // insert as a new row
            // $insertedRowsCoordinate = array();
            // for($rowIndicatorIndex = $mergeRowsCount; $rowIndicatorIndex>0; $rowIndicatorIndex--){
            //     $copyRowPosition = $mergeRows[$rowIndicatorIndex-1];
            //     $insertRowPosition = $insertRowStartPosition+$mergeRowsCount-$rowIndicatorIndex;

            //     // $this->CopyRange($worksheet, "B$copyRowPosition:$highestColumn$copyRowPosition", "B$insertRowPosition");

            //     // fixed: 20190729, copy rows overwrite the row content, insert new row first then copy row content
            //     $spreadsheet->getActiveSheet()->insertNewRowBefore($insertRowPosition, 1);
            //     $this->CopyRows($worksheet, "B$copyRowPosition:$highestColumn$copyRowPosition", "B$insertRowPosition");

            //     array_push($insertedRowsCoordinate, $insertRowPosition);
            // }

            $dataRow = $_dataSet["rows"][$rowPointer];
            $this->MergeDataRow($_indicator, $dataRow);

            // for($colPointer=2; $colPointer<=$highestColumnIndex; $colPointer++){
            //     foreach($insertedRowsCoordinate as $counter => $rowPosition){

            //         // get cell value
            //         $cellValue = $worksheet->getCellByColumnAndRow($colPointer, $rowPosition)->getValue();
            //         // print_r(" cellValue is $cellValue");
        
            //         // match expression between dataRow and cell
            //         $dataRow = $_dataSet["rows"][$rowPointer];
            //         $mergedValue = $cellValue;
            //         $isMerge = false;
            //         foreach ($dataRow as $columnName => $dataColValue){
            //             $isMatch = false;
            //             $findExpression = "";

            //             // if {{expression}} contains columnName
            //             if(strpos($cellValue, "{{".$columnName."}}")!== false){
            //                 $findExpression = "{{".$columnName."}}";
            //                 $isMatch = true;
            //             }

            //             // if {{expression}} contains tableName.columnName
            //             else if(strpos($cellValue, "{{".$dataTableName.".".$columnName."}}")!== false){
            //                 $findExpression = "{{".$dataTableName.".".$columnName."}}";
            //                 $isMatch = true;
            //             }

            //             if($isMatch){
            //                 // print_r($isMatch);
            //                 // print_r("\r\n");
            //                 // print_r(" findExpression is $findExpression");
            //                 // print_r("\r\n");
            //                 // print_r(" replace with is $dataColValue");
            //                 // print_r("\r\n");
            //                 // print_r(" cellValue is $cellValue");
            //                 // print_r("\r\n");

            //                 $isMerge = true;

            //                 $mergedValue = str_replace($findExpression,$dataColValue,$mergedValue);
            //             }
            //         }
            //         // set cell value
            //         if($isMerge){
            //             $worksheet->setCellValueByColumnAndRow($colPointer, $rowPosition, $mergedValue);
            //         }
            //     }
            // }
        }

        // // remove template rows from excel bottom
        // for($removeRowPointer = $mergeRowsCount; $removeRowPointer>0; $removeRowPointer--){
        //     $worksheet->removeRow($mergeRows[$removeRowPointer-1], 1);
        // }
    }
    function MergeDataRows($_indicator, $_dataRows){
        foreach($_dataRows as $index => $dataRow){
            $this->MergeDataRow($_indicator, $dataRow);
        }
    }
    function MergeDataRow($_indicator, $_dataRow){
        $spreadsheet = $this->GetSpreadsheet();
        $worksheet = $this->GetSpreadsheet()->getActiveSheet();

        $highestColumn = $worksheet->getHighestColumn(); // e.g 'F'
        $highestColumnIndex = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($highestColumn);

        $insertedRowsCoordinate = array();
        $involvedRowsNum = array();

        // 1. find the indicator's bottom row number
        $bottomRowNum = 0;
        foreach($this->columnAMapping->ShiftedTemplateMergePosition->$_indicator as $index => $rowNum){
            if($rowNum > $bottomRowNum){
                $bottomRowNum = $rowNum;
            }
            array_push($involvedRowsNum, $rowNum);
        }

        // 2. find how many rows needed to insert
        $countNewRows = count($this->columnAMapping->ShiftedTemplateMergePosition->$_indicator);
        // 3. insert the new row(s)
        $worksheet->insertNewRowBefore($bottomRowNum, $countNewRows);

        // 4. copy template cell value to newly inserted row
        foreach($this->columnAMapping->ShiftedTemplateRowPosition->$_indicator as $template_row_index => $template_row_positon){
            $this->CopyRows($worksheet, "B$template_row_positon:$highestColumn$template_row_positon", "B".($bottomRowNum+$template_row_index));
            
            // for($_colPointer = 1; $_colPointer<$highestColumnIndex; $_colPointer++){
            //     $_rowPosition = $template_row_positon;
            // }
                

            // // get cell value
            // $cellValue = $worksheet->getCellByColumnAndRow($_colPointer, $_rowPosition)->getValue();

            // // check is formula

            // // update formula reference


            array_push($insertedRowsCoordinate, ($bottomRowNum+$template_row_index));
        }

        // print_r("\ninserted indicator: $_indicator row position: $involvedRowsNum[0] \n");

        // 5. shift other indicator's template rows number
        $templateRowsShadow = clone($this->columnAMapping->ShiftedTemplateRowPosition);
        foreach($templateRowsShadow as $template_indicator => $other_indicator_rows){
            // skip same indicator, scan other indicator
            if($template_indicator == $_indicator) { continue; }

            // check is other indicator's row position lower than merged template row originally
            $isOtherIndicatorLower = false;
            foreach($other_indicator_rows as $indicator_row_index => $other_template_row_num){
                foreach($involvedRowsNum as $involvedRowIndex => $involvedRowNum){
                    // make flag, if indicator's row number bigger than merged template row
                    if($other_template_row_num >= $involvedRowNum){
                        $isOtherIndicatorLower = true;
                        break;
                    }
                }

                if($isOtherIndicatorLower){
                    break;
                }
            }

            if(!$isOtherIndicatorLower){
                // skip if indicator position higher than the inserted row
                continue;
            }
            
            // if other indicator's row position lower than merged template row originally
            if($isOtherIndicatorLower){
                // shift other indicator's row number
                foreach($other_indicator_rows as $indicator_row_index => $other_template_row_num){
                    $template_row_array = $this->columnAMapping->ShiftedTemplateRowPosition->$template_indicator;
                    // $template_row_array[$indicator_row_index] = $other_template_row_num + $countNewRows;
                    $template_row_array[$indicator_row_index] += $countNewRows;
                    $this->columnAMapping->ShiftedTemplateRowPosition->$template_indicator = $template_row_array;
                }
            }
        }

        // shift other indicator's template merge number
        $templateMergeShadow = clone($this->columnAMapping->ShiftedTemplateMergePosition);
        foreach($templateMergeShadow as $template_indicator => $other_indicator_rows){
            // skip same indicator, scan other indicator
            // if($template_indicator == $_indicator) { continue; }

            // check is other indicator's row position lower than merged template row originally
            $isOtherIndicatorLower = false;
            foreach($other_indicator_rows as $indicator_row_index => $other_template_row_num){
                foreach($involvedRowsNum as $involvedRowIndex => $involvedRowNum){
                    // make flag, if indicator's row number bigger than merged template row
                    if($other_template_row_num >= $involvedRowNum){
                        $isOtherIndicatorLower = true;
                        break;
                    }
                }

                if($isOtherIndicatorLower){
                    break;
                }
            }
            
            // // if other indicator's row position lower than merged template row originally
            if($isOtherIndicatorLower){
                // shift other indicator's row number
                $other_merge_rows_copy = $other_indicator_rows;
                foreach($other_indicator_rows as $indicator_row_index => $other_template_row_num){
                    $other_merge_rows_copy[$indicator_row_index] += $countNewRows;
                }
                $this->columnAMapping->ShiftedTemplateMergePosition->$template_indicator = $other_merge_rows_copy;
            }
        }

        // merge value into newly inserted rows
        for($colPointer=2; $colPointer<=$highestColumnIndex; $colPointer++){
            foreach($insertedRowsCoordinate as $counter => $rowPosition){
                $this->MergeCellExpression($colPointer, $rowPosition, $_dataRow);
            }
        }

        $this->columnAMapping->PrintedTimes->$_indicator++;
    }

    function MergeCellExpression($_colPointer, $_rowPosition, $_dataRow){
        $spreadsheet = $this->GetSpreadsheet();
        $worksheet = $this->GetSpreadsheet()->getActiveSheet();

        // get cell value
        $cellValue = $worksheet->getCellByColumnAndRow($_colPointer, $_rowPosition)->getValue();

        // skip to next column if cell value is empty or null
        if($cellValue == null or empty($cellValue)){
            return;
        }

        // match expression between dataRow and cell
        $dataRow = $_dataRow;
        $mergedValue = $cellValue;
        $isMerge = false;

        // scan all dataRow's value
        foreach ($dataRow as $columnName => $dataValue){
            $isMatch = false;
            $findExpression = "";

            // if {{expression}} contains columnName
            if(strpos($cellValue, "{{".$columnName."}}")!== false){
                $findExpression = "{{".$columnName."}}";
                $isMatch = true;
            }

            // if {{expression}} contains tableName.columnName
            // else if(strpos($cellValue, "{{".$dataTableName.".".$columnName."}}")!== false){
            //     $findExpression = "{{".$dataTableName.".".$columnName."}}";
            //     $isMatch = true;
            // }

            if($isMatch){
                $isMerge = true;
                $mergedValue = str_replace($findExpression,$dataValue,$mergedValue);
            }
        }
        // set cell value
        if($isMerge){
            $worksheet->setCellValueByColumnAndRow($_colPointer, $_rowPosition, $mergedValue);
        }
    }

    function Save($_fileType = ""){
        if(!$this->CheckIsTemplateExists())
            return;
        if($_fileType){
            $this->outputAsFileType = $this->fileType[$_fileType];

            if($_fileType == $this->fileType["pdf"]){
                $this->outputAsFileType = $this->fileType["xlsx"];
            }
        }

        $this->SetExportFileLocation();

        // set metadata
        $this->CreateSpreadsheetMetadata();

        // set footer
        $this->InitializeFooter();

        $spreadsheet = $this->GetSpreadsheet();

        // hide A column
        // $spreadsheet->getActiveSheet()->getColumnDimension('A')->setVisible(false);

        // remove template rows from excel bottom
        $this->RemovePrintedTemplateRows();

        // remove A column
        $spreadsheet->getActiveSheet()->removeColumn('A', 1);

        if($this->outputAsFileType == $this->fileType["pdf"]){
            // $writer = \PhpOffice\PhpSpreadsheet\IOFactory::createWriter($spreadsheet, 'Mpdf');

            // Or alternatively
            // Mpdf
            $class = \PhpOffice\PhpSpreadsheet\Writer\Pdf\Mpdf::class;
            \PhpOffice\PhpSpreadsheet\IOFactory::registerWriter('Pdf', \PhpOffice\PhpSpreadsheet\Writer\Pdf\Mpdf::class);

            // Tcpdf
            // $class = \PhpOffice\PhpSpreadsheet\Writer\Pdf\Tcpdf::class;
            // \PhpOffice\PhpSpreadsheet\IOFactory::registerWriter('Pdf', \PhpOffice\PhpSpreadsheet\Writer\Pdf\Tcpdf::class);

            // Dompdf
            // $class = \PhpOffice\PhpSpreadsheet\Writer\Pdf\Dompdf::class;
            // \PhpOffice\PhpSpreadsheet\IOFactory::registerWriter('Pdf', \PhpOffice\PhpSpreadsheet\Writer\Pdf\Dompdf::class);

            $writer = \PhpOffice\PhpSpreadsheet\IOFactory::createWriter($spreadsheet, 'Pdf');
            
            // Or alternatively
            // $writer = new \PhpOffice\PhpSpreadsheet\Writer\Pdf\Mpdf($spreadsheet);

            $writer->setTempDir(__DIR__."/../temp/export/");
            // $writer->setPreCalculateFormulas(false);
        }else if($this->outputAsFileType == $this->fileType["xlsx"]){
            $writer = new Xlsx($spreadsheet);
        }else if($this->outputAsFileType == $this->fileType["xls"]){
            $writer = \PhpOffice\PhpSpreadsheet\IOFactory::createWriter($spreadsheet, 'Xls');
        }

        $savedPath = $this->GetExportFileLocation();
        $writer->save($savedPath);

        if($_fileType == $this->fileType["pdf"]){
            $officeToPDFPath = __DIR__."/../third-party/PDF-engine/OfficeToPDF.exe";
            $excelFilePath = $savedPath;
            $pdfFilePath = __DIR__.'/../temp/export/'.$this->templateName.".". $this->fileType["pdf"];
            
            // convert the excel to pdf file
            if(file_exists($officeToPDFPath)){
                if(file_exists($excelFilePath)){
                //    chdir(__DIR__);
                    chdir(__DIR__."/../third-party/PDF-engine/");
                    $cmdOutput = shell_exec("OfficeToPDF.exe /hidden /readonly /excel_active_sheet ".$excelFilePath." ".$pdfFilePath);
                    $savedPath = $pdfFilePath;
                }else{
                    // array_push($processMessageList, "Excel was not found, cannot convert to pdf file. $excelFilePath");
                }
            }
        }
        
		$fileAsByteArray = $this->GetFileAsByteArray($savedPath);
		$fileAsString = $this->GetFileAsString($savedPath);

		// return $fileAsByteArray;
		$responseArray = Core::CreateResponseArray();
		$responseArray["FileAsByteArray"] = $fileAsByteArray;
		$responseArray["FileAsByteString"] = $fileAsString;
		$responseArray["FileAsBase64"] = base64_encode(file_get_contents($savedPath));
		$responseArray['access_status'] = Core::$access_status['OK'];
        $responseArray["filename"] = $this->templateName.".". $_fileType;

		return $responseArray;
    }

    function RemovePrintedTemplateRows(){
        $worksheet = $this->GetSpreadsheet()->getActiveSheet();

        // Get the highest row and column numbers referenced in the worksheet
        $highestRow = $worksheet->getHighestRow(); // e.g. 10
        $highestColumn = $worksheet->getHighestColumn(); // e.g 'F'
        $highestColumnIndex = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($highestColumn); // e.g. 5
        
        $printedTemplateRows = array();
        for ($rowIndex = 1; $rowIndex <= $highestRow; $rowIndex++) {
            // read column A only
            $cellValue = $worksheet->getCellByColumnAndRow(1, $rowIndex)->getValue();

            $isIndicatorValid = false;
            // skip header indicator 'H'
            // if(strpos($cellValue, "H") !== FALSE) { continue; }
            
            if(property_exists($this->columnAMapping->PrintedTimes, $cellValue)){
                if($this->columnAMapping->PrintedTimes->$cellValue > 0){
                    $isIndicatorValid = true;
                }
            }

            // if invalid, read next row
            if(!$isIndicatorValid) continue;

            array_push($printedTemplateRows, $rowIndex);
        }
        rsort($printedTemplateRows);
        foreach($printedTemplateRows as $arrayIndex => $rowPositon){
            $worksheet->removeRow($rowPositon, 1);
        }
    }
    
    function CreateSpreadsheetMetadata(){

        $spreadsheet = $this->GetSpreadsheet();

        // $spreadsheet->getProperties()
        //     ->setCreator("PHPSpreadsheet")
        //     ->setLastModifiedBy("PIMS")
        //     ->setTitle("Office 2007 XLSX Test Document")
        //     ->setSubject("Office 2007 XLSX Test Document")
        //     ->setDescription(
        //         "Test document for Office 2007 XLSX, generated using PHP classes."
        //     )
        //     ->setKeywords("office 2007 openxml php")
        //     ->setCategory("Test result file");

        $spreadsheet->getProperties()
            ->setCreator("PIMS");
    }

    function SetTemplateName($_templateName){
        $this->templateName = $_templateName;
    }
    function SetTemplateLocation($_templateLocation){
        $this->templateLocation = $_templateLocation;
    }
    function SetExportFileLocation(){
        $this->filenamePost = __DIR__.'/../temp/export/'.$this->templateName.".". $this->outputAsFileType;
    }
    function SetSpreadsheet($_spreadsheet){
        $this->spreadsheet = $_spreadsheet;
    }
    function GetTemplateName(){
        return $this->templateName.".".$this->templateExtension;
    }
    function GetTemplateLocation(){
        return $this->templateLocation;
    }
    function GetExportFilename(){
        return $this->templateName.".". $this->outputAsFileType;
    }
    function GetExportFileLocation(){
        return $this->filenamePost;
    }
    protected function CreateSpreadsheet(){
        $this->spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($this->GetTemplateLocation());
    }
    function GetSpreadsheet(){
        return $this->spreadsheet;
    }
	
	function setFileName($name){
		$this->filename = $name;
	}

	function AddTable($tableName){
		$isInArray = in_array($tableName, $this->tableList);
		if(!$isInArray)
			array_push($this->tableList, $tableName);
	}

	/* &$objPHPExcel pass by reference */
	function PrepareExportingData(&$objPHPExcel, $currentTableName){
		// Initialise the Excel row number
		$rowCount = 1;
		$column = 'A';
		$columnIndex = 0;

		$this->currentWorkSheetIndex++;

		$worksheetIndex = $this->currentWorkSheetIndex;

		$tableObject = new SimpleTableManager();
		$tableObject->Initialize($currentTableName);

		// Create a new worksheet called "TableName"
		$myWorkSheet = new PHPExcel_Worksheet($objPHPExcel, $currentTableName);
		$objPHPExcel->addSheet($myWorkSheet, $worksheetIndex);
		$objPHPExcel->setActiveSheetIndex($worksheetIndex);
        
        // 'Arial Unicode MS' is a common unicode font style installed with some popular MS product such as MS Office
        // use this font will support to display chinese, japanese in PDf file
//        $objPHPExcel->getDefaultStyle()->getFont()->setName('Arial Unicode MS')->setSize(12);
        $objPHPExcel->getDefaultStyle()->getFont()->setName('sun-exta')->setSize(12);
		
		$tableObject->topRightToken = true;
		$resultSet = $tableObject->select();

		// Get proposed export column header sequence
		if(!array_key_exists($currentTableName, $this->proposedExportColumnSequence)){
			$this->proposedExportColumnSequence[$currentTableName] = array();
		}
		$this->proposedExportColumnSequence[$currentTableName] = $this->GetDefaultExportColumnSequence($currentTableName, $tableObject);

		$toBeExportHeaderSequence = $this->proposedExportColumnSequence[$currentTableName];
		// echo json_encode($toBeExportHeaderSequence, JSON_PRETTY_PRINT);

		// Build column header in excel engine
		foreach ($toBeExportHeaderSequence as $key => $headerColumn) {

			//$excelCellCoordinate = $this->getNameFromNumber($columnIndex).$rowCount;
			$excelCellCoordinate = PHPExcel_Cell::stringFromColumnIndex($columnIndex).$rowCount;
			$excelColumnCoordinate = PHPExcel_Cell::stringFromColumnIndex($columnIndex).":".PHPExcel_Cell::stringFromColumnIndex($columnIndex);
            
			if(Core::IsSystemField($headerColumn))
				continue;
			//$objPHPExcel->setActiveSheetIndex(0)->SetCellValue($excelCellCoordinate, $headerColumn);
			$objPHPExcel->getActiveSheet()->SetCellValue($excelCellCoordinate, $headerColumn);

			$tempDataType = Core::SearchDataType($tableObject->dataSchema['data'], 'Field', $headerColumn)[0]['Type'];

			switch (true) {
				case strpos($tempDataType, "char") !== FALSE:
				case strpos($tempDataType, "varchar") !== FALSE:
				case strpos($tempDataType, "text") !== FALSE:
					$objPHPExcel->getActiveSheet()->getStyle($excelColumnCoordinate)
					    ->getNumberFormat()
					    ->setFormatCode('@');
					break;
				case strpos($tempDataType, "tinyint") !== FALSE:
				case strpos($tempDataType, "smallint") !== FALSE:
				case strpos($tempDataType, "mediumint") !== FALSE:
				case strpos($tempDataType, "int") !== FALSE:
				case strpos($tempDataType, "bigint") !== FALSE:
				case strpos($tempDataType, "year") !== FALSE:
					preg_match_all('!\d+!', $tempDataType, $columnLength);
					if(isset($columnLength[0])){
						$format = str_pad('',$columnLength[0][0],"#");
						$objPHPExcel->getActiveSheet()->getStyle($excelColumnCoordinate)
						    ->getNumberFormat()
						    ->setFormatCode($format);
					}
					break;
				case strpos($tempDataType, "float") !== FALSE:
				case strpos($tempDataType, "double") !== FALSE:
					preg_match_all('!\d+!', $tempDataType, $columnLength);
					// print_r($columnLength[0][0]);
					if(isset($columnLength[0][0]) && isset($columnLength[0][1])){
						$format1 = str_pad('',$columnLength[0][0],"#");
						$format2 = str_pad('',$columnLength[0][1],"0");
						$objPHPExcel->getActiveSheet()->getStyle($excelColumnCoordinate)
						    ->getNumberFormat()
						    ->setFormatCode("$format1.$format2");
					}
					break;
			}


			// Start - format whole column as datetime format if datetime column
			// un like SpreadsheetGear, need to specifically hard code the format and the applied rows.
			// PHPExcel doesn't support column or row styling: you need to set the style for a range of cells
			// http://stackoverflow.com/questions/22090978/phpexcel-how-to-change-data-type-for-whole-column-of-an-excel
			// Worksheet and workbook specifications and limits, excel max. Worksheet size: 1,048,576 rows by 16,384 columns
			/*
			$tempDataType = $this->SearchDataType($tableObject->dataSchema['data'], 'Field', $headerColumn)[0]['Type'];
			$columnIndexInString = PHPExcel_Cell::stringFromColumnIndex($columnIndex); // A/B/C
			switch ($tempDataType) {
				case $tempDataType==="date":
					$objPHPExcel->getActiveSheet()->getStyle($columnIndexInString.($rowCount+1).":".$columnIndexInString."10000")
					->getNumberFormat()
					->setFormatCode('yyyy-m-d');
					break;
				case $tempDataType==="datetime":
				case $tempDataType==="timestamp":
					$objPHPExcel->getActiveSheet()->getStyle($columnIndexInString.($rowCount+1).":".$columnIndexInString."10000")
					->getNumberFormat()
					->setFormatCode('yyyy-m-d hh:mm:ss');
					break;
				case $tempDataType==="time":
					$objPHPExcel->getActiveSheet()->getStyle($columnIndexInString.($rowCount+1).":".$columnIndexInString."10000")
					->getNumberFormat()
					->setFormatCode('hh:mm:ss');
					break;
			}
			*/
			// End - format whole column as datetime format
			 
			$columnIndex++;
		}

		/* Start - set spreadsheet header column */
		// 20150427, keithpoon, export column according to the sequence scheme
		// insert all the column setted in the sequence scheme
		// $tempExportColumnSequence = $this->GetCustomizeExportColumnSequence();
		// $sortedColumnName = $this->GetCustomizeExportColumnSequence();

		// if($tempExportColumnSequence){
		// 	// if table name setted in the sequence scheme
		// 	if(array_key_exists($currentTableName, $tempExportColumnSequence)){
		// 		foreach ($tempExportColumnSequence[$currentTableName] as $indexNum => $sortedColumnName){
		// 			// skip column is Top Priority
		// 			if( $this->IsSkipExportThisColumn($currentTableName, $sortedColumnName))
		// 				continue;

		// 			array_push($this->proposedExportColumnSequence[$currentTableName], $sortedColumnName);

		// 			$excelCellCoordinate = PHPExcel_Cell::stringFromColumnIndex($columnIndex).$rowCount;
		// 			$objPHPExcel->getActiveSheet()->SetCellValue($excelCellCoordinate, $sortedColumnName);
		// 			$columnIndex++;
		// 		}
		// 	}
		// }


		// 20150123, keithpoon, enhance the column name better
		// if(!$this->isExportSequencedColumnOnly)
		// foreach($tableObject->_ as $headerColumn => $defaultValue){
		// 	// skip column is Top Priority
		// 	if( $this->IsSkipExportThisColumn($currentTableName, $sortedColumnName))
		// 		continue;

		// 	// skip sorted column already inserted at above
		// 	if(array_key_exists($currentTableName, $tempExportColumnSequence)){
		// 		if(in_array($headerColumn, $tempExportColumnSequence[$currentTableName])){
		// 			continue;
		// 		}
		// 	}

		// 	//$excelCellCoordinate = $this->getNameFromNumber($columnIndex).$rowCount;
		// 	$excelCellCoordinate = PHPExcel_Cell::stringFromColumnIndex($columnIndex).$rowCount;
		// 	if(Core::IsSystemField($headerColumn))
		// 		continue;
		// 	//$objPHPExcel->setActiveSheetIndex(0)->SetCellValue($excelCellCoordinate, $headerColumn);
		// 	$objPHPExcel->getActiveSheet()->SetCellValue($excelCellCoordinate, $headerColumn);
			
		// 	// Start - format whole column as datetime format if datetime column
		// 	// un like SpreadsheetGear, need to specifically hard code the format and the applied rows.
		// 	// PHPExcel doesn't support column or row styling: you need to set the style for a range of cells
		// 	// http://stackoverflow.com/questions/22090978/phpexcel-how-to-change-data-type-for-whole-column-of-an-excel
		// 	// Worksheet and workbook specifications and limits, excel max. Worksheet size: 1,048,576 rows by 16,384 columns
		// 	/*
		// 	$tempDataType = $this->SearchDataType($tableObject->dataSchema['data'], 'Field', $headerColumn)[0]['Type'];
		// 	$columnIndexInString = PHPExcel_Cell::stringFromColumnIndex($columnIndex); // A/B/C
		// 	switch ($tempDataType) {
		// 		case $tempDataType==="date":
		// 			$objPHPExcel->getActiveSheet()->getStyle($columnIndexInString.($rowCount+1).":".$columnIndexInString."10000")
		// 			->getNumberFormat()
		// 			->setFormatCode('yyyy-m-d');
		// 			break;
		// 		case $tempDataType==="datetime":
		// 		case $tempDataType==="timestamp":
		// 			$objPHPExcel->getActiveSheet()->getStyle($columnIndexInString.($rowCount+1).":".$columnIndexInString."10000")
		// 			->getNumberFormat()
		// 			->setFormatCode('yyyy-m-d hh:mm:ss');
		// 			break;
		// 		case $tempDataType==="time":
		// 			$objPHPExcel->getActiveSheet()->getStyle($columnIndexInString.($rowCount+1).":".$columnIndexInString."10000")
		// 			->getNumberFormat()
		// 			->setFormatCode('hh:mm:ss');
		// 			break;
		// 	}
		// 	*/
		// 	// End - format whole column as datetime format
			 
		// 	$columnIndex++;

		// 	// array_push($this->proposedExportColumnSequence[$currentTableName], $headerColumn);
		// }
		/* End - set spreadsheet header column */
		

		/* export worksheet content */
		if(!$this->isTemplate){
			$rowCount = 2;
			// if selectd record count's is not zero
			if(count($resultSet['data'])>0)
				foreach($resultSet['data'] as $rowIndex => $row){
					$columnIndex = 0;
					// loop each column in $row
					// 20150427, keithpoon, export data according to the
					$tempExportedColumnOrder = $this->proposedExportColumnSequence[$currentTableName];

					//foreach($row as $colName => $tempColValue)
					foreach($tempExportedColumnOrder as $key => $colName)
					{
						$tempColValue = $row[$colName];

						if(Core::IsSystemField($colName)) // skip export value when system fields
							continue;
						$excelCellCoordinate = PHPExcel_Cell::stringFromColumnIndex($columnIndex).$rowCount;

						$tempDataType = Core::SearchDataType($tableObject->dataSchema['data'], 'Field', $colName)[0]['Type'];

								// echo $tempDataType;

						/* if data field is date/time/datetime/timestamp */
						/* format the cell as the related format */
						/* PHPExcel_Style_NumberFormat:http://www.grad.clemson.edu/assets/php/phpexcel/documentation/API/PHPExcel_Style/PHPExcel_Style_NumberFormat.html */
						switch ($tempDataType) {
							case $tempDataType==="date":
								$fitColumn = $this->getNameFromNumber($columnIndex);
								$objPHPExcel->getActiveSheet()->getStyle($excelCellCoordinate)
								    ->getNumberFormat()
								    ->setFormatCode('yyyy-mm-dd');
								break;
							case $tempDataType==="datetime":
							case $tempDataType==="timestamp":
								$fitColumn = $this->getNameFromNumber($columnIndex);
								$objPHPExcel->getActiveSheet()->getStyle($excelCellCoordinate)
								    ->getNumberFormat()
								    ->setFormatCode('yyyy-mm-dd hh:mm:ss');
								break;
							case $tempDataType==="time":
								$fitColumn = $this->getNameFromNumber($columnIndex);
								$objPHPExcel->getActiveSheet()->getStyle($excelCellCoordinate)
								    ->getNumberFormat()
								    ->setFormatCode('hh:mm:ss');
								break;
						}

						// switch (true) {
						// 	case strpos($tempDataType, "char") !== FALSE:
						// 	case strpos($tempDataType, "varchar") !== FALSE:
						// 	case strpos($tempDataType, "text") !== FALSE:
						// 	    $objRichText = new PHPExcel_RichText();
						// 		$$tempColValue = $objRichText->createText($tempColValue);
						// 		break;
						// }

						// switch (true) {
						// 	case strpos($tempDataType, "char") !== FALSE:
						// 	case strpos($tempDataType, "varchar") !== FALSE:
						// 	case strpos($tempDataType, "text") !== FALSE:
						// 		$objPHPExcel->getActiveSheet()->getStyle($excelCellCoordinate)
						// 		    ->getNumberFormat()
						// 		    ->setFormatCode('@');
						// 		break;
						// 	case strpos($tempDataType, "tinyint") !== FALSE:
						// 	case strpos($tempDataType, "smallint") !== FALSE:
						// 	case strpos($tempDataType, "mediumint") !== FALSE:
						// 	case strpos($tempDataType, "int") !== FALSE:
						// 	case strpos($tempDataType, "bigint") !== FALSE:
						// 		preg_match_all('!\d+!', $tempDataType, $columnLength);
						// 		if(isset($columnLength[0])){
						// 			$format = str_pad('',$columnLength[0][0],"#");
						// 			$objPHPExcel->getActiveSheet()->getStyle($excelCellCoordinate)
						// 			    ->getNumberFormat()
						// 			    ->setFormatCode($format);
						// 		}
						// 		break;
						// 	case strpos($tempDataType, "float") !== FALSE:
						// 	case strpos($tempDataType, "double") !== FALSE:
						// 		preg_match_all('!\d+!', $tempDataType, $columnLength);
						// 		// print_r($columnLength[0][0]);
						// 		if(isset($columnLength[0][0]) && isset($columnLength[0][1])){
						// 			$format1 = str_pad('',$columnLength[0][0],"#");
						// 			$format2 = str_pad('',$columnLength[0][1],"0");
						// 			$objPHPExcel->getActiveSheet()->getStyle($excelCellCoordinate)
						// 			    ->getNumberFormat()
						// 			    ->setFormatCode("$format1.$format2");
						// 		}
						// 		break;
						// }


						// if column value is not null and not empty
						if( isset( $tempColValue ) )
							//if( !empty($tempColValue) && $tempColValue != NULL ){
							if( $tempColValue != NULL ){
								
								// 20150706, fixed: leave the cell blank when datetime value is zero.
                                $isEmptyDate = false;
                                $isDateValue = false;
								switch ($tempDataType) {
									case $tempDataType==="date":
									case $tempDataType==="datetime":
									case $tempDataType==="timestamp":
									case $tempDataType==="time":
										if(strtotime($tempColValue) == 0 || empty($tempColValue))
                                            $isEmptyDate = true;
                                        $isDateValue = true;
                                        break;
                                        
                                        $dateObject = date_create($tempColValue);
                                        $tempColValue = $dateObject;
                                }
                                
								if($isDateValue){
                                    if(!$isEmptyDate){
                                        // 20180901, keithpoon, fixed: create date value in excel through PHPExcel_Shared_Date::PHPToExcel class
                                        switch ($tempDataType) {
                                            case $tempDataType==="date":
                                                $tempColValue = DateTime::createFromFormat('Y-m-d', $tempColValue)->setTime(0, 0, 0);
                                                break;
                                            case $tempDataType==="datetime":
                                                $tempColValue = DateTime::createFromFormat('Y-m-d H:i:s', $tempColValue);
                                                break;
                                            case $tempDataType==="timestamp":
                                                $tempColValue = DateTime::createFromFormat('Y-m-d H:i:s', $tempColValue);
                                                break;
                                            case $tempDataType==="time":
                                                $tempColValue = DateTime::createFromFormat('H:i:s', $tempColValue);
                                                break;
                                        }
                                        $objPHPExcel->getActiveSheet()->setCellValue($excelCellCoordinate, PHPExcel_Shared_Date::PHPToExcel($tempColValue));
                                        
                                    }
                                }else{
									$objPHPExcel->getActiveSheet()->setCellValue($excelCellCoordinate, $tempColValue);
                                }
							}

						$columnIndex++;
					}
					// Increment the Excel row counter
					$rowCount++;
				}
		}
		
		//$objPHPExcel->setActiveSheetIndex(0);
		
		/* set auto column width */
		$fitColumn = "A";
		$fitColumnIndex = 0;
		//while ($fitColumn != $column){
		while ($fitColumnIndex != $columnIndex){
			$fitColumn = $this->getNameFromNumber($fitColumnIndex);
			$objPHPExcel->getActiveSheet()->getColumnDimension($fitColumn)->setAutoSize(true);
			$fitColumnIndex++;
		}
	}

	function SetExportColumnSequence($tableName, $columnName, $index=NULL){
		$exportColumnSequence = $this->customizeExportColumnSequence;

		if($this->IsSystemField($columnName))
			return;

		$insertThisColumn = array($columnName);

		// create table sequence scheme if not found
		if (!array_key_exists($tableName, $exportColumnSequence)){
			array_push($exportColumnSequence, $tableName);
			$exportColumnSequence[$tableName] = array();
		}

		// column sequence index
		if(Core::IsNullOrEmptyString($index))
		{
			$index = count($exportColumnSequence[$tableName]);
		}

		// add column in sequence if not exists
		if (!array_key_exists($columnName, $exportColumnSequence[$tableName])){
			//array_push($exportColumnSequence[$tableName], $columnName);
			array_splice( $exportColumnSequence[$tableName], $index, 0, $insertThisColumn );
		}

		$this->customizeExportColumnSequence = $exportColumnSequence;
	}

	function SetSkipExportColumn($tableName, $skipColumnName){
		$skipExportColumnScheme = $this->skipExportColumnScheme;

		if(Core::IsSystemField($skipColumnName))
			return;

		$skipThisColumn = array($skipColumnName);

		// create table skip scheme if not found
		if (!array_key_exists($tableName, $skipExportColumnScheme)){
			array_push($skipExportColumnScheme, $tableName);
			$skipExportColumnScheme[$tableName] = array();
		}

		// add column in sequence if not exists
		if (!array_key_exists($skipColumnName, $skipExportColumnScheme[$tableName])){
			array_push($skipExportColumnScheme[$tableName], $skipColumnName);
		}

		$this->skipExportColumnScheme = $skipExportColumnScheme;
	}

	function IsSkipExportThisColumn($tableName, $skipColName){
		$isSkipExportThisColumn = false;
		$skipExportColumnScheme = $this->GetSkipExportColumn();

		if(!empty($skipExportColumnScheme))
			if (array_key_exists($tableName, $skipExportColumnScheme)){
				//if (array_key_exists($skipColName, $skipExportColumnScheme[$tableName])){
				if (in_array($skipColName, $skipExportColumnScheme[$tableName])){
					$isSkipExportThisColumn = true;
				}
			}

		// echo "skip col:$skipColName in table: $tableName = ".$isSkipExportThisColumn;

		return $isSkipExportThisColumn;
	}

	function GetCustomizeExportColumnSequence(){
		$exportColSequence = $this->customizeExportColumnSequence;

		// if(count($exportColSequence)==0)
		// 	return false;
		// 	//return array();
		return $exportColSequence;
	}

	// 20161006, keithpoon, move the code to the function
	function GetDefaultExportColumnSequence($tableName, $tableObject){
		$defaultColumnOrder = array();
		$customizeColumnOrder = $this->GetCustomizeExportColumnSequence();

		if($customizeColumnOrder && array_key_exists($tableName, $customizeColumnOrder)){
			foreach ($customizeColumnOrder[$tableName] as $key => $headerColumn) {
				array_push($defaultColumnOrder, $headerColumn);
			}
		}

		foreach($tableObject->_ as $headerColumn => $defaultValue){
			// skip column is Top Priority
			if( $this->IsSkipExportThisColumn($tableName, $headerColumn))
				continue;

			// skip sorted column already inserted at above
			if(array_key_exists($tableName, $customizeColumnOrder)){
				if(in_array($headerColumn, $customizeColumnOrder[$tableName])){
					continue;
				}
			}

			// if(!$this->isExportSequencedColumnOnly){
			array_push($defaultColumnOrder, $headerColumn);
			// }
		}

		// $this->defaultExportColumnOrder = $defaultColumnOrder;

		return $defaultColumnOrder;
	}

	function GetSkipExportColumn(){
		$skipExportColumnScheme = $this->skipExportColumnScheme;

		//if(count($skipExportColumnScheme)==0)
			//return false;
		// 	//return array();
		return $skipExportColumnScheme;
	}

	function ClearExportColumnSequence(){
		$this->customizeExportColumnSequence = array();
		return true;
	}

	function ClearSkipExportColumn(){
		$this->skipExportColumnScheme = array();
		return true;
	}


	function BeforeExportExcel(){
		// $this->GetCustomizeExportColumnSequence();
		// $this->GetSkipExportColumn();

		$this->proposedExportColumnSequence = array();
	}
	
	function Export(){
		$this->BeforeExportExcel();
		// Instantiate a new PHPExcel object
		$this->objPHPExcel = new PHPExcel();
		$objPHPExcel = new PHPExcel();
		// Set the active Excel worksheet to sheet 0
		//$objPHPExcel->setActiveSheetIndex(0);

		// $objPHPExcel->getProperties()->setCreator("Maarten Balliauw")
		// ->setLastModifiedBy("Maarten Balliauw")
		// ->setTitle("Office 2007 XLSX Test Document")
		// ->setSubject("Office 2007 XLSX Test Document")
		// ->setDescription("Test document for Office 2007 XLSX, generated using PHP classes.")
		// ->setKeywords("office 2007 openxml php")
		// ->setCategory("Test result file");

		$objPHPExcel->getProperties()->setCreator("PIMS")
		->setTitle($this->fileTitle)
		->setCategory("Utility Import/Export Template")
		->setDescription("This document involved ".count($this->tableList)." table(s).");
		
		$objPHPExcel->removeSheetByIndex(0);

		if(count($this->tableList)>0){
			//foreach($this->tableList as $key => $tableName) {
			foreach($this->tableList as $tableName) {
				$this->PrepareExportingData($objPHPExcel, $tableName);
			}
		}

		// assign the output file type
		if(Core::IsNullOrEmptyString($this->outputAsFileType)){
			//$this->outputAsFileType = $this->fileType["xlsx"];
			$this->outputAsFileType = "xlsx";
		}else if(!array_key_exists($this->outputAsFileType, $this->fileType)){
			$this->outputAsFileType = "pdf";
		}

		// assign the filename
		if(Core::IsNullOrEmptyString($this->filename)){
            if(count($this->tableList) == 1)
                $this->filename = $this->tableList[0];
            // this will return ConnectionManager.php, because the import/export call are centralize in it
            // else
            //     $this->filename = basename($_SERVER['PHP_SELF']);
            else
                $this->filename = "Excel";

            if($this->isTemplate)
                $this->filename .= "_Template";
            $this->filename .= ".".date('Ymd_His');
        }


		$this->filenamePost = $this->filename.".".date('Ymd_His').".".$this->outputAsFileType;

		// $exportFilename = $this->filename.".".date('Ymd_His').".".$this->outputAsFileType;
		$exportedPath = BASE_EXPORT.$this->filenamePost;

		// echo $this->filenamePost;

		// Change these values to select the Rendering library that you wish to use and its directory location on your server

		// $rendererName = PHPExcel_Settings::PDF_RENDERER_DOMPDF;
		// $rendererLibrary = 'PDF engine/dompdf/dompdf-0.6.2/';
		// local the dompdf enginer folder, PHPExcel 1.8.0+ not support dompdf 0.7.0+
		//$rendererLibrary = 'PDF engine/dompdf/dompdf-0.7.0/';

		// extremely slow performance
		// $rendererName = PHPExcel_Settings::PDF_RENDERER_TCPDF;
		// $rendererLibrary = 'PDF engine/TCPDF/TCPDF-6.2.13/';

		$rendererName = PHPExcel_Settings::PDF_RENDERER_MPDF;
		$rendererLibrary = 'PDF engine/MPDF/mpdf-6.1.3/';
		
		$rendererLibraryPath = BASE_3RD . $rendererLibrary;

		//$rendererLibraryPath = $this->base_Path["serverHost"].$this->base_Path["thrid-party"].$rendererLibrary;

		//echo "<br>$rendererLibraryPath<br>";
		//echo "<br>".dirname(__FILE__)."<br>";
				
		switch($this->outputAsFileType){
			case "xlsx":
				$objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel2007');
				$objWriter->save($exportedPath);
				break;
			case "xls":
				$objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel5');
				$objWriter->save($exportedPath);
				break;
			case "pdf":

				if (!PHPExcel_Settings::setPdfRenderer(
						$rendererName,
						$rendererLibraryPath
				)) {
					die(
							'NOTICE: Please set the $rendererName and $rendererLibraryPath values' .
							'<br />' .
							'at the top of this script as appropriate for your directory structure'
					);
				}
				
				
				// // Redirect output to a client¡¦s web browser (PDF)
				// header('Content-Type: application/pdf');
				// header('Content-Disposition: attachment;filename="'.$this->filenamePost.'"');
				// header('Cache-Control: max-age=0');
				
				$objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'PDF');
				// $objWriter->save('php://output');
				$objWriter->save($exportedPath);
				break;
		}

		$fileAsByteArray = $this->GetFileAsByteArray($exportedPath);
		$fileAsString = $this->GetFileAsString($exportedPath);

		// return $fileAsByteArray;
		$responseArray = Core::CreateResponseArray();
		$responseArray["FileAsByteArray"] = $fileAsByteArray;
		$responseArray["FileAsByteString"] = $fileAsString;
		$responseArray["FileAsBase64"] = base64_encode(file_get_contents($exportedPath));
		$responseArray['access_status'] = Core::$access_status['OK'];
        $responseArray["filename"] = $this->filename.".".$this->outputAsFileType;

		return $responseArray;
	}

	function GetFileAsByteArray($filename){
		// $byteArray = unpack("N*", file_get_contents($filename));
		$handle = fopen($filename, "rb");
		$fsize = filesize($filename);
		$contents = fread($handle, $fsize);

		// 20160927, keithpoon, i don't kown why the array index start from 1
		$byteArray = unpack("N*",$contents);
		$newByteArray = array();

		$arrayIndex = 0;
		foreach ($byteArray as $key => $value){
			$newByteArray[$arrayIndex] = $value;
			$arrayIndex++;
		}
		
		return $newByteArray;
	}

	function GetFileAsString($filename){
		// $byteArray = unpack("N*", file_get_contents($filename));
		$handle = fopen($filename, "rb");
		$fsize = filesize($filename);
		$contents = fread($handle, $fsize);
		$byteArray = unpack("N*",$contents);

		$string = "";
		foreach ($byteArray as $key => $value)
		{ 
			$string = $string.$value;
		    //echo $byteArray[$n];
		}
		
		return $string;
	}


	function Import($uploadedExcelPath, $importType = IMPORTTYPE_INSERTANDUPDATE)
	{
		$isInsertAndUpdate = $importType == IMPORTTYPE_INSERTANDUPDATE;
		$isInsert = $importType == IMPORTTYPE_INSERT;
		$isUpdate = $importType == IMPORTTYPE_UPDATE;
		$this->excelSheetsHeader = array();
		
		$dataSet = array();

		// Convert worksheet to array
		foreach($this->tableList as $tableName) {
			$dataSet[$tableName] = $this->ConvertWorksheet2Array($uploadedExcelPath, $tableName);
		}
		// Import worksheet
		foreach($this->tableList as $tableName) {
			$tempProcessMessage = "Import $tableName";
			array_push($this->processMessageList, $tempProcessMessage);
            $dataTable = $dataSet[$tableName]['excelData'];
			$this->ImportData($dataTable, $tableName);
		}

		//return json_encode($dataSet, JSON_PRETTY_PRINT);
		//return json_encode($this->processMessageList, JSON_PRETTY_PRINT);

		$responseArray = Core::CreateResponseArray();
		// $this->responseArray['importResult'] = $this->processMessageList;

//		$responseArray = $this->GetResponseArray();
		$responseArray['processed_message'] = $this->processMessageList;
		$responseArray['access_status'] = Core::$access_status['OK'];
		
		return $responseArray;
		
		// return $this->processMessageList;
	}
	
	function ImportData($dataTable, $tableName){
		for($tableRowIndex=0; $tableRowIndex < count($dataTable); $tableRowIndex++){
			$addThisRow = $dataTable[$tableRowIndex];
			$dataTable[$tableRowIndex] = $this->AmendDataRowBeforeGoToImport($tableName, $tableRowIndex, $addThisRow);
		}

		// print_r($dataTable);
		// return;
		$this->ImportInsertOrUpdateData($dataTable, $tableName);
	}
	
	function ImportInsertOrUpdateData($insertCurDataTable, $tableName){
		for($tableRowIndex = 0; $tableRowIndex < count($insertCurDataTable); $tableRowIndex++){
			$_tableManager = new SimpleTableManager();
			$_tableManager->Initialize($tableName);
			
			$importThisRow = $insertCurDataTable[$tableRowIndex];
			
			$importThisRow = $this->UpdateDataRowBeforeImport($tableName, $tableRowIndex, $importThisRow);
			$_tableManager->setArrayIndex();
			foreach($importThisRow as $columnName => $cellValue) {
				// 20161019, keithpoon, 0 should not seem as null or empty in some real case
				// if(!empty($cellValue))

				// 20161113, keithpoon, try to set NULL to datetime field if it is null
				// if(is_null($cellValue))
				// 	$_tableManager->$columnName = NULL;
				// else
					$_tableManager->$columnName = $cellValue;
			}

			// print_r($_tableManager->_);
			// continue;
			
			$this->CustomImportInsertOrUpdateData($_tableManager, $tableRowIndex);
			
			$_tableManager->close();
		}
	}
	
	function AmendDataRowBeforeGoToImport($tableName, $excelRowIndex, $addThisRow){
		//print_r($addThisRow);
		return $addThisRow;
	}
	
	function UpdateDataRowBeforeImport($tableName, $excelRowIndex, $importThisRow){
		return $importThisRow;
	}
	
	function CustomImportInsertOrUpdateData($tableObject, $rowIndex){
		$isPKMissing = true;
        $isPKAutoIncrement = false;
		$primaryKeySchema = $tableObject->getPrimaryKeyName();
        $keyString = "";
        
        $dataSchema = $tableObject->dataSchema;
        
		foreach ($primaryKeySchema['data']['Field'] as $index => $pkFieldName){
            // if primary key allow auto_increment, by pass the checking
            foreach ($dataSchema['data'] as $index => $value){
                $column = $value['Field'];
                $type = $value['Type'];
                if($column == $pkFieldName){
                    if($value['Extra']){
                        $isPKAutoIncrement = true;
                        break;
                    }
                }
            }

			if(Core::IsNullOrEmptyString($tableObject->_[$pkFieldName])){
				$isPKMissing = $isPKMissing && true;
				//break;
			}else{
				$keyString = $keyString . $tableObject->_[$pkFieldName].", ";
				$isPKMissing = false;
			}
		}
		$keyString = trim($keyString, ", ");
		
		$excelRowIndex = $rowIndex + 1;
		$responseArray = array();
		$tempProcessMessage = "";
		
		$tableObject->topRightToken = true;
        $tableObject->debug = true;

		// Check key exists
		$isKeyExists = $tableObject->CheckKeyExists();
		// Update if exists, insert if not exists
        
		if($isKeyExists){
            $responseArray = $tableObject->update(true);
        }
		else{
            $responseArray = $tableObject->insert();
            
            if($isPKMissing && $isPKAutoIncrement){
                $keyString = $responseArray['insert_id'];
            }
        }

    //    print_r($responseArray);

		if(!$isKeyExists)
		{
			if($responseArray['affected_rows'] > 0){
				$tempProcessMessage = "Rows ".$excelRowIndex." "."inserted: ".$keyString;
			}else{
				$tempProcessMessage = "Rows ".$excelRowIndex." insert ".$responseArray['access_status'].": ".$responseArray['error'];
			}
		}else{
			if($responseArray['affected_rows'] > 0){
				$tempProcessMessage = "Rows ".$excelRowIndex." "."updated: ".$keyString;
			}
			// sql query result is success but no rows updated.
			// because the imported data total same as the record in database, no records will be changes.
			else if($responseArray["access_status"] == Core::$access_status["OK"]){
				$tempProcessMessage = "Rows ".$excelRowIndex." sql query sccuess but no record updated.";	
			}
			else{
				$tempProcessMessage = "Rows ".$excelRowIndex." update ".$responseArray['access_status'].": ".$responseArray['error'];
			}
		}
		
		array_push($this->processMessageList, $tempProcessMessage);
	}
	

	function CreateArrayFromTable($tableName)
	{

	}
	
	/**
	 * return excel array which contains
	 * 
	 *  excel header name, row data records, data schema
	 */
	function ConvertWorksheet2Array($readExcelPath, $tableName, $readStartFromRow=2){
		$worksheetInfo = array();
		$excelArray = array();
// 		$excelArray['Indexed'] = array();
// 		$excelArray['Associative'] = array();
		$rowIndex = 0;

		$objReader = PHPExcel_IOFactory::createReaderForFile($readExcelPath);
		$objReader->setReadDataOnly(true);
		$objReader->setLoadSheetsOnly( array($tableName) );

		$objPHPExcel = new PHPExcel();
		$objPHPExcel = $objReader->load($readExcelPath);

		$objWorksheet = $objPHPExcel->getActiveSheet();

		$_noOfUsedRows = $objWorksheet->getHighestRow();
		$_noOfUsedColsInString = $objWorksheet->getHighestColumn();
		$_noOfUsedCols = PHPExcel_Cell::columnIndexFromString($_noOfUsedColsInString);

		$_tableManager = new SimpleTableManager();
		$_tableManager->Initialize($tableName);
		
		$worksheetInfo['dataSchema'] = $_tableManager->dataSchema['data'];
		$worksheetInfo['excelScannedRow'] = $_noOfUsedRows - ($readStartFromRow -1);
		$worksheetInfo['excelRow'] = $rowIndex;
		$worksheetInfo['excelCol'] = $_noOfUsedCols;
		
		// store the excel header to this object
		$this->excelSheetsHeader[$tableName] = array();
		for($i=0; $i<$_noOfUsedCols; $i++){
			$excelColHeaderText = $objWorksheet->getCellByColumnAndRow($i, 1)->getValue();
			array_push($this->excelSheetsHeader[$tableName], $excelColHeaderText);
		}

		$skipExcelRowCounter = $readStartFromRow;

		// convert the excel to array
		foreach ($objWorksheet->getRowIterator() as $row) {
			if($skipExcelRowCounter > 1){
				$skipExcelRowCounter--;
				continue;
			}
			$excelArray[$rowIndex] = array();

			$cellIterator = $row->getCellIterator();
			$cellIterator->setIterateOnlyExistingCells(false);
			// This loops all cells,
			// even if it is not set.
			// By default, only cells
			// that are set will be
			// iterated.

			$isWholeRowEmpty = true;
			$colIndex = 0;
			foreach ($cellIterator as $cell) {
				$headerName = $this->excelSheetsHeader[$tableName][$colIndex];
				$columnFound = $this->MappingSheetColumnsWithDataTable($_tableManager, $headerName);
				// echo "column $headerName found result (bool)".$columnFound;

				if((bool)$columnFound){
					// 20161019, keithpoon, 0 should not seem as null or empty in some real case
					// if(is_null($cell->getValue()) || empty($cell->getValue())){
					$cellValue = $cell->getValue();
					if(is_null($cellValue) || $cellValue == "")
					{
						$isWholeRowEmpty = $isWholeRowEmpty && true;
						$excelArray[$rowIndex][$headerName] = $cellValue;
						$colIndex++;
						continue;
					}else{
						$isWholeRowEmpty = false;
					}
					
					// extract the Data Type
					$columnInfo = $_tableManager->getColumnInfo($headerName);

					if(strpos($columnInfo['Type'], '(') !== false)
						$columnInfo['Type'] = substr($columnInfo['Type'], 0, strpos($columnInfo['Type'], '('));
					
					$format = "Y-m-d H:i:s";
					
					$type = $columnInfo['Type'];
					
					if($columnInfo){
						switch($type){
							case "datetime":
							case "timestamp":
								$dateTimeValue = $cell->getFormattedValue();
								//$cellValue = date($format, PHPExcel_Shared_Date::ExcelToPHP($dateTimeValue, true, date_default_timezone_get()));
								//$cellValue = date($format, PHPExcel_Shared_Date::ExcelToPHP($dateTimeValue, true, 'Asia/Hong_Kong'));
								//$cellValue = date($format, PHPExcel_Shared_Date::ExcelToPHP($dateTimeValue, true, 'UTC'));
								// echo "cellValue:$cellValue, dateTimeValue:$dateTimeValue";
								$cellValue = date($format, PHPExcel_Shared_Date::ExcelToPHP($dateTimeValue));
								// echo "cellValue2:$cellValue";

								
								$tempDateObj = new DateTime();
								$tempDateObj = date_create_from_format($format, $cellValue);
                                // 20180829, keithpoon, PHPExcel translates to UTC time inside, and then go back to the default timezone.
                                // https://stackoverflow.com/questions/10887967/phpexcel-gets-wrong-timezone-even-after-setting-date-default-timezone-set/31237645#31237645
                                // should not add 8 hours to Hong Kong local time zone by manual 
								// $tempDateObj->sub(new DateInterval('PT8H'));
								
								$cellValue = $tempDateObj->format($format);
								break;
							case "date":
								$format = "Y-m-d";
								$dateTimeValue = $cell->getFormattedValue();
								$cellValue = date($format, PHPExcel_Shared_Date::ExcelToPHP($dateTimeValue));
								//$cellValue = date($format, PHPExcel_Shared_Date::ExcelToPHP($dateTimeValue, true, date_default_timezone_get()));
								
								$tempDateObj = new DateTime();
								$tempDateObj = date_create_from_format($format, $cellValue);
                                // 20180829, keithpoon, PHPExcel translates to UTC time inside, and then go back to the default timezone.
                                // $tempDateObj->sub(new DateInterval('PT8H'));
                                
                                $cellValue = $tempDateObj->format($format);
                                
								break;
							case "time":
								$format = "H:i:s";
								$dateTimeValue = $cell->getFormattedValue();
								$cellValue = date($format, PHPExcel_Shared_Date::ExcelToPHP($dateTimeValue));
								//$cellValue = date($format, PHPExcel_Shared_Date::ExcelToPHP($dateTimeValue, true, date_default_timezone_get()));
								//$cellValue = date($format, PHPExcel_Shared_Date::ExcelToPHP($dateTimeValue, true, 'Asia/Hong_Kong'));
								
								$tempDateObj = new DateTime();
								$tempDateObj = date_create_from_format($format, $cellValue);
                                // 20180829, keithpoon, PHPExcel translates to UTC time inside, and then go back to the default timezone.
								// $tempDateObj->sub(new DateInterval('PT8H'));
								
								$cellValue = $tempDateObj->format($format);
								break;
							case "tinyint":
								break;
							case "smallint":
								break;
							case "mediumint":
								break;
							case "int":
								break;
							case "bigint":
								break;
                            case "year":
                                break;
							
							case "float":
								break;
							case "double":
								break;
							case "decimal":
								break;

							case "varchar":
								break;
							case "char":
								break;
							case "text":
								break;
							default:
                                $cellValue = $cell->getValue();
								break;
						}
					}else{
						echo "column not found";
					}
					
					$excelArray[$rowIndex][$headerName] = $cellValue;
					
					// 20150701, Not very useful
					//$excelArray[$headerName][$rowIndex] = $cell->getValue();
					
				}
				$colIndex++;
			}
			if($isWholeRowEmpty){
				unset($excelArray[$rowIndex]);
				continue;
			}
			$rowIndex++;
		}

		$worksheetInfo['excelRow'] = $rowIndex;
		$worksheetInfo['excelHeader'] = $this->excelSheetsHeader[$tableName];
		$worksheetInfo['excelData'] = $excelArray;
		
		$_tableManager->close();
		
		return $worksheetInfo;
	}
	
	/**
	 * map sheet column with table schema
	 * return a int position
	 */
	function MappingSheetColumnsWithDataTable($tableObject, $columnName){
		//return true;
		return $this->DefaultMappingSheetColumnsWithDataTable($tableObject, $columnName);
	}

	private function DefaultMappingSheetColumnsWithDataTable($tableObject, $columnName, $ignoreNotFoundColumn = true){
		if(!$ignoreNotFoundColumn)
			return true;
		$activeSheetCells = array();
		$rowIndex = 0;

		//return true;
		// i don't know why IsColumnExists return empty =.=
		//return $tableObject->IsColumnExists($columnName);
		
		// this also doesn't work
 		//if (array_key_exists($columnName, $tableObject->_))
 		//	return array_search($columnName, $tableObject->_);
				
		$columnIndex=0;
		foreach($tableObject->_ as $key => $value){
			if($key==$columnName)
				break;
			$columnIndex++;
		}
		
		if($columnIndex >=0)
			return true;
		
		//return $columnIndex;
	}
	/*
	private function DefaultMappingSheetColumnsWithDataTable($tableName, $excelWorkSheets, $ignoreNotFoundColumn = true){
		$activeSheetCells = array();
		$rowIndex = 0;

		$tableObject = new SimpleTableManager();
		$tableObject->Initialize($tableName);
		
		// convert the excel to array
		foreach ($excelWorkSheets->getRowIterator() as $row) {
			if($skipExcelRowCounter > 1){
				$skipExcelRowCounter--;
				continue;
			}
			$activeSheetCells[$rowIndex] = array();
		
			$cellIterator = $row->getCellIterator();
			$cellIterator->setIterateOnlyExistingCells(false); // This loops all cells,
			// even if it is not set.
			// By default, only cells
			// that are set will be
			// iterated.
				
			$colIndex = 0;
			foreach ($cellIterator as $cell) {
				$headerName = $this->excelSheetsHeader[$tableName][$colIndex];
				if($tableObject->IsColumnExists($headerName) || !$ignoreNotFoundColumn){
					$activeSheetCells[$rowIndex][$headerName] = $cell->getValue();
					$activeSheetCells[$headerName][$rowIndex] = $cell->getValue();
				}
				$colIndex++;
			}
			$rowIndex++;
		}
		return $activeSheetCells;
	}*/

    function __isset($name) {
        return isset($this->_[$name]);
    }
	
	// http://stackoverflow.com/questions/181596/how-to-convert-a-column-number-eg-127-into-an-excel-column-eg-aa
	/*
	function GetExcelColumnName($columnNumber)
	{
		$dividend = $columnNumber;
		$columnName = "";
		$modulo;

		while ($dividend > 0)
		{
			$modulo = ($dividend - 1) % 26;
			$columnName = chr(65 + $modulo) + $columnName;
			$dividend = (($dividend - $modulo) / 26);
		} 

		return $columnName;
	}
	*/
	//http://stackoverflow.com/questions/3302857/algorithm-to-get-the-excel-like-column-name-of-a-number
	function getNameFromNumber($num) {
		$numeric = $num % 26;
		$letter = chr(65 + $numeric);
		$num2 = intval($num / 26);
		if ($num2 > 0) {
			return getNameFromNumber($num2 - 1) . $letter;
		} else {
			return $letter;
		}
	}
}
?>

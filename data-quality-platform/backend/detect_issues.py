"""
Comprehensive Data Quality Issue Detection with Exact Locations
Uses pandas, numpy for thorough rule-based detection
"""

import pandas as pd
import numpy as np
import json
import sys
import re
from datetime import datetime, timedelta
from typing import List, Dict, Any

class DataQualityDetector:
    def __init__(self, data: List[Dict], table_name: str):
        """Initialize detector with data"""
        self.df = pd.DataFrame(data)
        self.table_name = table_name
        self.issues = []
        self.total_rows = len(self.df)
        self.total_cols = len(self.df.columns)
        
    def detect_all_issues(self):
        """Run all detection methods"""
        print(f"🔍 Scanning {self.table_name}: {self.total_rows} rows × {self.total_cols} columns", file=sys.stderr)
        
        # Run all detection methods
        self.detect_missing_values()
        self.detect_null_placeholders()
        self.detect_duplicates()
        self.detect_invalid_emails()
        self.detect_invalid_phones()
        self.detect_invalid_dates()
        self.detect_negative_values()
        self.detect_outliers()
        self.detect_whitespace_issues()
        self.detect_format_inconsistencies()
        self.detect_referential_integrity()
        self.detect_data_type_mismatches()
        
        print(f"✅ Detected {len(self.issues)} issues with exact locations", file=sys.stderr)
        return self.issues
    
    def add_issue(self, issue: Dict):
        """Add an issue with validation"""
        if issue:
            self.issues.append(issue)
    
    def adjust_row_number(self, pandas_index: int) -> int:
        """
        Convert pandas 0-based index to data row number (1-based, not counting header)
        This matches the frontend table display
        Pandas index 0 = Row 1 (first data row)
        Pandas index 155 = Row 156 (156th data row)
        """
        return pandas_index + 1  # +1 for 1-based indexing (header not counted)
    
    def detect_missing_values(self):
        """Detect missing/null/empty values with exact locations"""
        for col in self.df.columns:
            # Check for: NaN, None, empty string, whitespace-only strings, and string 'nan'
            missing_mask = (
                self.df[col].isna() | 
                (self.df[col] == '') | 
                (self.df[col].astype(str).str.strip() == '') |
                (self.df[col].astype(str).str.lower() == 'nan') |
                (self.df[col].astype(str).str.lower() == 'none') |
                (self.df[col].astype(str).str.lower() == 'null')
            )
            missing_indices = self.df[missing_mask].index.tolist()
            
            if len(missing_indices) > 0:
                missing_percent = (len(missing_indices) / self.total_rows) * 100
                
                # Determine severity based on percentage and column importance
                if missing_percent > 50:
                    severity = 'critical'
                elif missing_percent > 25:
                    severity = 'high'
                elif missing_percent > 10:
                    severity = 'medium'
                else:
                    severity = 'low'
                
                self.add_issue({
                    'type': 'missing',
                    'severity': severity,
                    'column': col,
                    'title': f'Missing values in {col}',
                    'description': f'Found {len(missing_indices)} missing/null/empty values in column {col} ({missing_percent:.1f}%)',
                    'recordCount': len(missing_indices),
                    'impactScore': round(missing_percent, 1),
                    'affectedRows': [self.adjust_row_number(idx) for idx in missing_indices],  # All affected rows
                    'totalAffectedRows': len(missing_indices),
                    'exampleBadValues': ['NULL', 'empty', ''],
                    'expectedFormat': 'Non-empty values',
                    'exactLocations': [{'row': self.adjust_row_number(idx), 'column': col, 'value': 'NULL/Empty'} for idx in missing_indices[:20]]
                })
    
    def detect_null_placeholders(self):
        """Detect placeholder values like 'BAD_PHONE', 'INVALID', 'N/A', etc."""
        placeholder_patterns = [
            r'BAD_\w+',
            r'INVALID\w*',
            r'NULL',
            r'N/A',
            r'NA',
            r'NONE',
            r'UNKNOWN',
            r'TBD',
            r'TODO',
            r'XXX',
            r'###',
            r'---',
            r'PLACEHOLDER',
            r'TEMP',
            r'TEST',
            r'DUMMY'
        ]
        
        pattern = '|'.join(placeholder_patterns)
        
        for col in self.df.columns:
            if self.df[col].dtype == 'object':  # String columns
                placeholder_mask = self.df[col].astype(str).str.contains(pattern, case=False, na=False, regex=True)
                placeholder_indices = self.df[placeholder_mask].index.tolist()
                
                if len(placeholder_indices) > 0:
                    bad_values = self.df.loc[placeholder_indices, col].unique().tolist()[:10]
                    
                    self.add_issue({
                        'type': 'invalid',
                        'severity': 'high',
                        'column': col,
                        'title': f'Invalid placeholder values in {col}',
                        'description': f'Found {len(placeholder_indices)} placeholder/invalid values like {", ".join(map(str, bad_values[:3]))}',
                        'recordCount': len(placeholder_indices),
                        'impactScore': round((len(placeholder_indices) / self.total_rows) * 100, 1),
                        'affectedRows': [self.adjust_row_number(idx) for idx in placeholder_indices],
                        'totalAffectedRows': len(placeholder_indices),
                        'exampleBadValues': [str(v) for v in bad_values[:5]],
                        'expectedFormat': 'Valid data values (no placeholders)',
                        'exactLocations': [
                            {'row': self.adjust_row_number(idx), 'column': col, 'value': str(self.df.loc[idx, col])} 
                            for idx in placeholder_indices[:20]
                        ]
                    })
    
    def detect_duplicates(self):
        """Detect duplicate rows with exact locations"""
        # Full row duplicates
        duplicate_mask = self.df.duplicated(keep=False)
        duplicate_indices = self.df[duplicate_mask].index.tolist()
        
        if len(duplicate_indices) > 0:
            # Group duplicates
            duplicate_groups = []
            seen = set()
            
            for idx in duplicate_indices:
                if idx not in seen:
                    row_data = self.df.iloc[idx].to_dict()
                    matching = self.df[
                        (self.df == row_data).all(axis=1)
                    ].index.tolist()
                    
                    if len(matching) > 1:
                        duplicate_groups.append(matching)
                        seen.update(matching)
            
            # Adjust row numbers in duplicate groups
            adjusted_groups = [[self.adjust_row_number(idx) for idx in group] for group in duplicate_groups]
            
            self.add_issue({
                'type': 'duplicate',
                'severity': 'high' if len(duplicate_indices) > 10 else 'medium',
                'column': 'all',
                'title': f'Duplicate records detected',
                'description': f'Found {len(duplicate_indices)} duplicate rows in {len(duplicate_groups)} groups',
                'recordCount': len(duplicate_indices),
                'impactScore': round((len(duplicate_indices) / self.total_rows) * 100, 1),
                'affectedRows': [self.adjust_row_number(idx) for idx in duplicate_indices],
                'totalAffectedRows': len(duplicate_indices),
                'exampleBadValues': [f'Rows {group}' for group in adjusted_groups[:3]],
                'expectedFormat': 'Unique records',
                'exactLocations': [
                    {'row': self.adjust_row_number(idx), 'column': 'all', 'value': f'Duplicate of rows {adjusted_groups[i]}'} 
                    for i, group in enumerate(duplicate_groups[:10]) 
                    for idx in group[:2]
                ],
                'duplicateGroups': adjusted_groups[:50]  # First 50 groups
            })
        
        # Column-specific duplicates (e.g., duplicate IDs)
        for col in self.df.columns:
            if 'id' in col.lower() or 'code' in col.lower() or 'sku' in col.lower():
                col_duplicates = self.df[self.df[col].duplicated(keep=False) & self.df[col].notna()]
                if len(col_duplicates) > 0:
                    dup_indices = col_duplicates.index.tolist()
                    dup_values = col_duplicates[col].unique().tolist()[:5]
                    
                    self.add_issue({
                        'type': 'duplicate',
                        'severity': 'high',
                        'column': col,
                        'title': f'Duplicate values in {col}',
                        'description': f'Found {len(dup_indices)} duplicate values in {col} (should be unique)',
                        'recordCount': len(dup_indices),
                        'impactScore': round((len(dup_indices) / self.total_rows) * 100, 1),
                        'affectedRows': [self.adjust_row_number(idx) for idx in dup_indices],
                        'totalAffectedRows': len(dup_indices),
                        'exampleBadValues': [str(v) for v in dup_values],
                        'expectedFormat': 'Unique identifier values',
                        'exactLocations': [
                            {'row': self.adjust_row_number(idx), 'column': col, 'value': str(self.df.loc[idx, col])} 
                            for idx in dup_indices[:20]
                        ]
                    })
    
    def detect_invalid_emails(self):
        """Detect invalid email formats with exact locations"""
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        
        for col in self.df.columns:
            if 'email' in col.lower():
                invalid_indices = []
                
                for idx, value in self.df[col].items():
                    if pd.notna(value) and value != '':
                        if not re.match(email_pattern, str(value)):
                            invalid_indices.append(idx)
                
                if len(invalid_indices) > 0:
                    bad_emails = self.df.loc[invalid_indices, col].head(5).tolist()
                    
                    self.add_issue({
                        'type': 'invalid',
                        'severity': 'medium',
                        'column': col,
                        'title': f'Invalid email format in {col}',
                        'description': f'Found {len(invalid_indices)} invalid email addresses',
                        'recordCount': len(invalid_indices),
                        'impactScore': round((len(invalid_indices) / self.total_rows) * 100, 1),
                        'affectedRows': [self.adjust_row_number(idx) for idx in invalid_indices],
                        'totalAffectedRows': len(invalid_indices),
                        'exampleBadValues': [str(v) for v in bad_emails],
                        'expectedFormat': 'user@domain.com',
                        'exactLocations': [
                            {'row': self.adjust_row_number(idx), 'column': col, 'value': str(self.df.loc[idx, col])} 
                            for idx in invalid_indices[:20]
                        ]
                    })
    
    def detect_invalid_phones(self):
        """Detect invalid phone numbers with exact locations"""
        for col in self.df.columns:
            if 'phone' in col.lower():
                invalid_indices = []
                
                for idx, value in self.df[col].items():
                    if pd.notna(value) and value != '':
                        # Remove common separators
                        cleaned = re.sub(r'[-\s()\.]', '', str(value))
                        # Check if it's a valid phone (10-15 digits, optional +)
                        if not re.match(r'^\+?\d{10,15}$', cleaned):
                            invalid_indices.append(idx)
                
                if len(invalid_indices) > 0:
                    bad_phones = self.df.loc[invalid_indices, col].head(5).tolist()
                    
                    self.add_issue({
                        'type': 'invalid',
                        'severity': 'medium',
                        'column': col,
                        'title': f'Invalid phone format in {col}',
                        'description': f'Found {len(invalid_indices)} invalid phone numbers',
                        'recordCount': len(invalid_indices),
                        'impactScore': round((len(invalid_indices) / self.total_rows) * 100, 1),
                        'affectedRows': [self.adjust_row_number(idx) for idx in invalid_indices],
                        'totalAffectedRows': len(invalid_indices),
                        'exampleBadValues': [str(v) for v in bad_phones],
                        'expectedFormat': '+[country code][number] (10-15 digits)',
                        'exactLocations': [
                            {'row': self.adjust_row_number(idx), 'column': col, 'value': str(self.df.loc[idx, col])} 
                            for idx in invalid_indices[:20]
                        ]
                    })
    
    def detect_invalid_dates(self):
        """Detect invalid date formats and logical date issues"""
        for col in self.df.columns:
            if 'date' in col.lower() or 'time' in col.lower():
                invalid_indices = []
                future_indices = []
                old_indices = []
                
                for idx, value in self.df[col].items():
                    if pd.notna(value) and value != '':
                        try:
                            date_val = pd.to_datetime(value)
                            
                            # Check if date is in future
                            if date_val > datetime.now():
                                future_indices.append(idx)
                            
                            # Check if date is very old (before 1900 or more than 50 years ago)
                            elif date_val.year < 1900 or date_val < datetime.now() - timedelta(days=365*50):
                                old_indices.append(idx)
                                
                        except:
                            invalid_indices.append(idx)
                
                # Invalid format
                if len(invalid_indices) > 0:
                    bad_dates = self.df.loc[invalid_indices, col].head(5).tolist()
                    
                    self.add_issue({
                        'type': 'invalid',
                        'severity': 'medium',
                        'column': col,
                        'title': f'Invalid date format in {col}',
                        'description': f'Found {len(invalid_indices)} unparseable date values',
                        'recordCount': len(invalid_indices),
                        'impactScore': round((len(invalid_indices) / self.total_rows) * 100, 1),
                        'affectedRows': [self.adjust_row_number(idx) for idx in invalid_indices],
                        'totalAffectedRows': len(invalid_indices),
                        'exampleBadValues': [str(v) for v in bad_dates],
                        'expectedFormat': 'ISO 8601 (YYYY-MM-DD) or parseable date',
                        'exactLocations': [
                            {'row': self.adjust_row_number(idx), 'column': col, 'value': str(self.df.loc[idx, col])} 
                            for idx in invalid_indices[:20]
                        ]
                    })
                
                # Future dates
                if len(future_indices) > 0:
                    self.add_issue({
                        'type': 'inconsistent',
                        'severity': 'medium',
                        'column': col,
                        'title': f'Future dates in {col}',
                        'description': f'Found {len(future_indices)} dates in the future',
                        'recordCount': len(future_indices),
                        'impactScore': round((len(future_indices) / self.total_rows) * 100, 1),
                        'affectedRows': [self.adjust_row_number(idx) for idx in future_indices[:100]],
                        'totalAffectedRows': len(future_indices),
                        'exampleBadValues': [str(self.df.loc[idx, col]) for idx in future_indices[:5]],
                        'expectedFormat': 'Dates not in the future',
                        'exactLocations': [
                            {'row': self.adjust_row_number(idx), 'column': col, 'value': str(self.df.loc[idx, col])} 
                            for idx in future_indices[:20]
                        ]
                    })
                
                # Very old dates
                if len(old_indices) > 5:  # Only flag if more than 5
                    self.add_issue({
                        'type': 'obsolete',
                        'severity': 'low',
                        'column': col,
                        'title': f'Outdated timestamps in {col}',
                        'description': f'Found {len(old_indices)} very old dates (>50 years or before 1900)',
                        'recordCount': len(old_indices),
                        'impactScore': round((len(old_indices) / self.total_rows) * 100, 1),
                        'affectedRows': [self.adjust_row_number(idx) for idx in old_indices[:100]],
                        'totalAffectedRows': len(old_indices),
                        'exampleBadValues': [str(self.df.loc[idx, col]) for idx in old_indices[:5]],
                        'expectedFormat': 'Recent dates',
                        'exactLocations': [
                            {'row': self.adjust_row_number(idx), 'column': col, 'value': str(self.df.loc[idx, col])} 
                            for idx in old_indices[:20]
                        ]
                    })
    
    def detect_negative_values(self):
        """Detect negative values where they shouldn't be"""
        negative_keywords = ['price', 'amount', 'quantity', 'count', 'total', 'qty', 'cost', 'balance', 'age']
        
        for col in self.df.columns:
            # Check if column is numeric and has negative keyword
            if any(keyword in col.lower() for keyword in negative_keywords):
                try:
                    numeric_col = pd.to_numeric(self.df[col], errors='coerce')
                    negative_mask = numeric_col < 0
                    negative_indices = self.df[negative_mask].index.tolist()
                    
                    if len(negative_indices) > 0:
                        bad_values = numeric_col[negative_indices].head(5).tolist()
                        
                        self.add_issue({
                            'type': 'invalid',
                            'severity': 'high',
                            'column': col,
                            'title': f'Negative values in {col}',
                            'description': f'Found {len(negative_indices)} negative values where they should be positive/zero',
                            'recordCount': len(negative_indices),
                            'impactScore': round((len(negative_indices) / self.total_rows) * 100, 1),
                            'affectedRows': [self.adjust_row_number(idx) for idx in negative_indices],
                            'totalAffectedRows': len(negative_indices),
                            'exampleBadValues': [str(v) for v in bad_values],
                            'expectedFormat': 'Positive or zero values',
                            'exactLocations': [
                                {'row': self.adjust_row_number(idx), 'column': col, 'value': str(self.df.loc[idx, col])} 
                                for idx in negative_indices[:20]
                            ]
                        })
                except:
                    pass
    
    def detect_outliers(self):
        """Detect statistical outliers using IQR method"""
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns
        
        for col in numeric_cols:
            if self.df[col].notna().sum() > 10:  # Need enough data
                Q1 = self.df[col].quantile(0.25)
                Q3 = self.df[col].quantile(0.75)
                IQR = Q3 - Q1
                
                lower_bound = Q1 - 3 * IQR
                upper_bound = Q3 + 3 * IQR
                
                outlier_mask = (self.df[col] < lower_bound) | (self.df[col] > upper_bound)
                outlier_indices = self.df[outlier_mask].index.tolist()
                
                if len(outlier_indices) > 0 and len(outlier_indices) < self.total_rows * 0.1:  # Less than 10%
                    outlier_values = self.df.loc[outlier_indices, col].head(5).tolist()
                    
                    self.add_issue({
                        'type': 'outlier',
                        'severity': 'low',
                        'column': col,
                        'title': f'Statistical outliers in {col}',
                        'description': f'Found {len(outlier_indices)} extreme values beyond 3×IQR (Q1={Q1:.2f}, Q3={Q3:.2f})',
                        'recordCount': len(outlier_indices),
                        'impactScore': round((len(outlier_indices) / self.total_rows) * 100, 1),
                        'affectedRows': [self.adjust_row_number(idx) for idx in outlier_indices],
                        'totalAffectedRows': len(outlier_indices),
                        'exampleBadValues': [str(v) for v in outlier_values],
                        'expectedFormat': f'Between {lower_bound:.1f} and {upper_bound:.1f}',
                        'exactLocations': [
                            {'row': self.adjust_row_number(idx), 'column': col, 'value': str(self.df.loc[idx, col])} 
                            for idx in outlier_indices[:20]
                        ]
                    })
    
    def detect_whitespace_issues(self):
        """Detect leading/trailing whitespace and excessive spacing"""
        for col in self.df.columns:
            if self.df[col].dtype == 'object':
                whitespace_indices = []
                
                for idx, value in self.df[col].items():
                    if pd.notna(value) and isinstance(value, str):
                        if value != value.strip() or '  ' in value:
                            whitespace_indices.append(idx)
                
                if len(whitespace_indices) > 5:  # Only flag if significant
                    self.add_issue({
                        'type': 'inconsistent',
                        'severity': 'low',
                        'column': col,
                        'title': f'Whitespace issues in {col}',
                        'description': f'Found {len(whitespace_indices)} values with leading/trailing spaces or excessive spacing',
                        'recordCount': len(whitespace_indices),
                        'impactScore': round((len(whitespace_indices) / self.total_rows) * 100, 1),
                        'affectedRows': [self.adjust_row_number(idx) for idx in whitespace_indices],
                        'totalAffectedRows': len(whitespace_indices),
                        'exampleBadValues': [f'"{self.df.loc[idx, col]}"' for idx in whitespace_indices[:5]],
                        'expectedFormat': 'Trimmed text without extra spaces',
                        'exactLocations': [
                            {'row': self.adjust_row_number(idx), 'column': col, 'value': f'"{self.df.loc[idx, col]}"'} 
                            for idx in whitespace_indices[:20]
                        ]
                    })
    
    def detect_format_inconsistencies(self):
        """Detect inconsistent formats within same column"""
        for col in self.df.columns:
            if self.df[col].dtype == 'object' and self.df[col].notna().sum() > 10:
                # Check date format consistency
                if 'date' in col.lower():
                    formats_found = {}
                    for idx, value in self.df[col].items():
                        if pd.notna(value):
                            val_str = str(value)
                            if re.match(r'\d{4}-\d{2}-\d{2}', val_str):
                                format_type = 'ISO'
                            elif re.match(r'\d{2}/\d{2}/\d{4}', val_str):
                                format_type = 'US'
                            elif re.match(r'\d{2}-\d{2}-\d{4}', val_str):
                                format_type = 'EU'
                            else:
                                format_type = 'OTHER'
                            
                            if format_type not in formats_found:
                                formats_found[format_type] = []
                            formats_found[format_type].append(idx)
                    
                    if len(formats_found) > 1:
                        minority_indices = []
                        for fmt, indices in sorted(formats_found.items(), key=lambda x: len(x[1]))[:-1]:
                            minority_indices.extend(indices)
                        
                        if len(minority_indices) > 0:
                            self.add_issue({
                                'type': 'inconsistent',
                                'severity': 'medium',
                                'column': col,
                                'title': f'Inconsistent date formats in {col}',
                                'description': f'Found {len(formats_found)} different date formats. Formats: {", ".join(formats_found.keys())}',
                                'recordCount': len(minority_indices),
                                'impactScore': round((len(minority_indices) / self.total_rows) * 100, 1),
                                'affectedRows': [self.adjust_row_number(idx) for idx in minority_indices],
                                'totalAffectedRows': len(minority_indices),
                                'exampleBadValues': [str(self.df.loc[idx, col]) for idx in minority_indices[:5]],
                                'expectedFormat': 'Consistent date format (preferably ISO 8601)',
                                'exactLocations': [
                                    {'row': self.adjust_row_number(idx), 'column': col, 'value': str(self.df.loc[idx, col])} 
                                    for idx in minority_indices[:20]
                                ]
                            })
    
    def detect_referential_integrity(self):
        """Detect foreign key violations"""
        # Common foreign key patterns
        fk_patterns = {
            'productid': 'product',
            'customerid': 'customer',
            'orderid': 'order',
            'warehouseid': 'warehouse',
            'inventoryid': 'inventory',
            'userid': 'user',
            'categoryid': 'category'
        }
        
        for col in self.df.columns:
            col_lower = col.lower()
            for fk_pattern, referenced_table in fk_patterns.items():
                if fk_pattern in col_lower:
                    # Check for values that seem out of range or invalid
                    try:
                        numeric_col = pd.to_numeric(self.df[col], errors='coerce')
                        
                        # Flag very large IDs (>100000) or negative IDs
                        invalid_mask = (numeric_col > 100000) | (numeric_col < 0)
                        invalid_indices = self.df[invalid_mask & numeric_col.notna()].index.tolist()
                        
                        if len(invalid_indices) > 0:
                            bad_values = self.df.loc[invalid_indices, col].head(5).tolist()
                            
                            self.add_issue({
                                'type': 'referential_integrity',
                                'severity': 'high',
                                'column': col,
                                'title': f'Potential foreign key violations in {col}',
                                'description': f'Found {len(invalid_indices)} IDs that appear out of valid range (referencing {referenced_table})',
                                'recordCount': len(invalid_indices),
                                'impactScore': round((len(invalid_indices) / self.total_rows) * 100, 1),
                                'affectedRows': [self.adjust_row_number(idx) for idx in invalid_indices],
                                'totalAffectedRows': len(invalid_indices),
                                'exampleBadValues': [str(v) for v in bad_values],
                                'expectedFormat': f'Valid {referenced_table} IDs (1-100000)',
                                'exactLocations': [
                                    {'row': self.adjust_row_number(idx), 'column': col, 'value': str(self.df.loc[idx, col])} 
                                    for idx in invalid_indices[:20]
                                ]
                            })
                    except:
                        pass
    
    def detect_data_type_mismatches(self):
        """Detect values that don't match expected data type"""
        for col in self.df.columns:
            # Detect numbers stored as text in numeric-named columns
            if any(keyword in col.lower() for keyword in ['id', 'count', 'number', 'qty', 'quantity', 'amount', 'price']):
                non_numeric_indices = []
                
                for idx, value in self.df[col].items():
                    if pd.notna(value) and value != '':
                        try:
                            float(value)
                        except:
                            non_numeric_indices.append(idx)
                
                if len(non_numeric_indices) > 0:
                    bad_values = self.df.loc[non_numeric_indices, col].head(5).tolist()
                    
                    self.add_issue({
                        'type': 'invalid',
                        'severity': 'medium',
                        'column': col,
                        'title': f'Data type mismatch in {col}',
                        'description': f'Found {len(non_numeric_indices)} non-numeric values in column that should be numeric',
                        'recordCount': len(non_numeric_indices),
                        'impactScore': round((len(non_numeric_indices) / self.total_rows) * 100, 1),
                        'affectedRows': [self.adjust_row_number(idx) for idx in non_numeric_indices],
                        'totalAffectedRows': len(non_numeric_indices),
                        'exampleBadValues': [str(v) for v in bad_values],
                        'expectedFormat': 'Numeric values',
                        'exactLocations': [
                            {'row': self.adjust_row_number(idx), 'column': col, 'value': str(self.df.loc[idx, col])} 
                            for idx in non_numeric_indices[:20]
                        ]
                    })
    
    def calculate_quality_scores(self):
        """Calculate quality dimension scores based on detected issues"""
        # Start with perfect scores
        scores = {
            'accuracy': 100,
            'completeness': 100,
            'consistency': 100,
            'uniqueness': 100,
            'validity': 100,
            'timeliness': 100,
            'integrity': 100
        }
        
        # Deduct points based on issues
        for issue in self.issues:
            impact = min(issue['impactScore'], 100)  # Cap at 100
            
            if issue['type'] == 'missing':
                scores['completeness'] -= impact * 0.5
            elif issue['type'] == 'invalid':
                scores['validity'] -= impact * 0.3
                scores['accuracy'] -= impact * 0.2
            elif issue['type'] == 'duplicate':
                scores['uniqueness'] -= impact * 0.5
            elif issue['type'] == 'inconsistent':
                scores['consistency'] -= impact * 0.3
            elif issue['type'] == 'outlier':
                scores['accuracy'] -= impact * 0.1
            elif issue['type'] == 'obsolete':
                scores['timeliness'] -= impact * 0.3
            elif issue['type'] == 'referential_integrity':
                scores['integrity'] -= impact * 0.4
        
        # Ensure scores don't go below 0
        for key in scores:
            scores[key] = max(0, round(scores[key], 1))
        
        # Calculate overall score (weighted average)
        overall = (
            scores['accuracy'] * 0.20 +
            scores['completeness'] * 0.20 +
            scores['consistency'] * 0.15 +
            scores['uniqueness'] * 0.10 +
            scores['validity'] * 0.20 +
            scores['timeliness'] * 0.05 +
            scores['integrity'] * 0.10
        )
        scores['overallScore'] = round(overall, 1)
        
        return scores


def main():
    """Main entry point"""
    try:
        # Read input JSON from stdin (avoids command-line length limits)
        input_json = sys.stdin.read()
        
        if not input_json:
            print(json.dumps({'error': 'No data provided'}))
            sys.exit(1)
        
        input_data = json.loads(input_json)
        data = input_data.get('data', [])
        table_name = input_data.get('tableName', 'Unknown')
        
        if not data:
            print(json.dumps({'error': 'Empty data'}))
            sys.exit(1)
        
        # Run detection
        detector = DataQualityDetector(data, table_name)
        issues = detector.detect_all_issues()
        quality_scores = detector.calculate_quality_scores()
        
        # Return results
        result = {
            'qualityScores': quality_scores,
            'issues': issues,
            'summary': f'Detected {len(issues)} data quality issues across {detector.total_cols} columns and {detector.total_rows} rows'
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()


